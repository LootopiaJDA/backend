import { Body, Controller, Get, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import type { Request, Response } from 'express';
import { ApiTags, ApiBody, ApiBearerAuth, ApiParam, ApiConsumes } from "@nestjs/swagger";
import { Role, Roles } from "src/decorators/role.decorator";
import { RolesGuard } from "src/guards/roles.guard";
import { AuthGuard } from "src/guards/auth.guard";
import { ChasseDto } from "src/dto/chasse.dto";
import { UserService } from "src/services/user.service";
import { JwtService } from "@nestjs/jwt";
import { ChasseService } from "src/services/chasse.service";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Multer } from 'multer';


@ApiTags('Chasse')
@Controller('chasse')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.PARTENAIRE)
export class ChasseController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly chasseService: ChasseService
    ) { }

    @ApiBearerAuth('access-token')
    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                localisation: { type: 'string' },
                idPartenaire: { type: 'number' },
                etat: { type: 'string', enum: ['PENDING', 'ACTIVE'] },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['name', 'localisation', 'etat', 'image'],
        },
    })
    async createChasse(
        @Body() body: ChasseDto,
        @UploadedFile() image: Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        const userInfo = await this.jwtService.verifyAsync(token);
        const user = await this.userService.getUser(userInfo.sub);

        await this.chasseService.createChasse({
            name: body.name,
            localisation: body.localisation,
            etat: body.etat,
            image: Buffer.from(image.buffer),
            partenaire: {
                connect: {
                    id_partenaire: Number(user!.partenerId),
                },
            },
        });


        return res.status(201).send({ message: 'Chasse created' });
    }

}