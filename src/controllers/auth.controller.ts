import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import type { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { ConnexionDto } from "../dto/connexion.tdo";
import { ApiBody } from "@nestjs/swagger";


@ApiTags('Connexion utilisateur')
@Controller('connexion')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post()
    @ApiBody({ type: ConnexionDto })
    async login(@Body() body: any, @Res() response: Response) {
        try {
            const jwt = await this.authService.login(body);
            response.status(200).send(jwt);
        } catch (error: any) {
            console.log(error);
            response.status(500).send(error.message);
        }
    }
}
