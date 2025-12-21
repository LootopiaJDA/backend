import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import type { Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto } from "../dto/user.tdo";
import { ApiTags, ApiBody, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { encryptText } from "src/services/crypto.service";
import { Role, Roles } from "src/decorators/role.decorator";
import { RolesGuard } from "src/guards/roles.guard";
import { AuthGuard } from "src/guards/auth.guard";
import { CreateUserPartenairDto } from "src/dto/partenair.dto";



@ApiTags('User')
@Controller('user')
export class UserController {
    // Get userService to access its methods via dependency injection
    constructor(private readonly userService: UserService) { }

    /**
     * Create a new user.
     *
     * @param {Request} body - Body's request.
     * @param {Response} response - Response object.
     */
    @Post()
    @ApiBody({ type: CreateUserDto })
    async createUser(@Body() body: any, @Res() response: Response): Promise<void> {
        try {
            // Encrypt the password before storing
            body.password = await encryptText(body.password as string);
            const user = await this.userService.createUser(body);
            response.status(201).send(user);
        } catch (error: any) {
            response.status(500).send(error.message);
        }
    }

    /**
     * Administrator can check all users.
     *
     * @param {Request} request - Montant HT.
     * @param {Response} response - Taux de TVA (ex: 0.20).
     */
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    async getAllUsers(@Req() request: Request, @Res() response: Response): Promise<void> {
        try {
            const users = await this.userService.getAllUsers();
            response.status(200).send(users);
        } catch (error: any) {
            response.status(500).send(error.message);
        }
    }

    /**
     * Update a user.
     *
     * @param {Object} params - User id provided.
     * @param {Object} body - User data to update.
     * @param {Response} response - Response object.
     */
    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard)
    @ApiBody({ type: UpdateUserDto })
    @ApiParam({ name: 'id', type: Number, description: 'User ID' })
    @Put(':id')
    async updateUser(@Param() params: any, @Body() body: any, @Res() response: Response): Promise<void> {
        try {
            const userId = params.id;
            const userData = body;
            if (userData.password) {
                userData.password = await encryptText(userData.password as string);
            }
            await this.userService.updateUser(userId, userData);
            // Implementation for updating a user goes here
            response.status(200).send({ message: 'User updated successfully' });
        } catch (error: any) {
            response.status(500).send(error.message);
        }
    }

    /**
     * Create a new user.
     *
     * @param {Request} body - Body's request.
     * @param {Response} response - Response object.
     */
    @Post('partenaire')
    @ApiBody({ type: CreateUserPartenairDto })
    async createPartenaireUser(@Body() body: any, @Res() response: Response): Promise<void> {
        try {
            // Encrypt the password before storing
            body.password = await encryptText(body.password as string);
            const user = await this.userService.createPartenaire(body);
            response.status(201).send(user);
        } catch (error: any) {
            response.status(500).send(error.message);
        }
    }
}
