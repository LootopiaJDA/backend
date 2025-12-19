import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { UserService } from "../services/user.service";
import type { Request, Response } from 'express';
import { CreateUserDto } from "../dto/user.tdo";
import { ApiTags, ApiBody } from "@nestjs/swagger";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiBody({ type: CreateUserDto })
    async createUser(@Body() body: any, @Res() response: Response) {
        try {
            const user = await this.userService.createUser(body);
            response.status(201).send(user);
        } catch (error) {
            console.log(error);
            response.status(500).send('Internal Server Error');
        }
    }
}