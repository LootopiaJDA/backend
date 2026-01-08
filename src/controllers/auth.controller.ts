import { Body, Controller, Get, HttpException, HttpStatus, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import type { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { ConnexionDto } from "../dto/connexion.tdo";
import { ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "../guards/auth.guard";


@ApiTags('Connexion utilisateur')
@Controller('connexion')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * User connexion endpoint.
     * @param {Body} body - Corps de la requête contenant les informations de connexion.
     * @param {Response} response - Objet de réponse Express.
     * @returns {void} - JWT token.
     */
    @Post()
    @ApiBody({ type: ConnexionDto })
    async login(
        @Body() body: ConnexionDto,
        @Res({ passthrough: true }) response: Response
    ): Promise<{ message: string }> {
        try {
            const jwt = await this.authService.login(body);

            response.cookie('access_token', jwt.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000,
                path: '/'
            });


            return { message: 'Connexion réussie' };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                error.message || 'Erreur lors de la connexion',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('logout')
    @UseGuards(AuthGuard)
    async logout(@Res({ passthrough: true }) res: Response): Promise<{message: string}> {
        res.clearCookie('access_token');
        return {message: 'Déconnexion réussie'}
    }
}


