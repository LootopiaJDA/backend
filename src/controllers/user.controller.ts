import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { UserService } from "../services/user.service";
import type { Request, Response } from 'express';
import { CreateUserDto } from "../dto/user.tdo";
import { ApiTags, ApiBody } from "@nestjs/swagger";
import { encryptText } from "src/services/crypto.service";



@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiBody({ type: CreateUserDto })
    async createUser(@Body() body: any, @Res() response: Response) {
        try {
            body.password = await encryptText(body.password as string);
            const user = await this.userService.createUser(body);
            response.status(201).send(user);
        } catch (error: any) {
            console.log(error);
            response.status(500).send(error.message);
        }
    }
}
