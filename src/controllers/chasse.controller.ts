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
import { Statuts } from "src/decorators/statut-partenaire.decorator";
import { StatutGuard } from "src/guards/partenaire.guard";
import { Statut } from "src/generated/prisma/browser";


@ApiTags('Chasse')
@Controller('chasse')
@Roles(Role.PARTENAIRE)
@Statuts(Statut.ACTIVE)
@UseGuards(AuthGuard, RolesGuard, StatutGuard)
export class ChasseController {
    // Must inject services to access them
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly chasseService: ChasseService
    ) { }

    // Need token in the header
    @ApiBearerAuth('access-token')
    // Post method to create a chasse
    @Post()
    // Specify multipart/form-data consumption for image integration
    @ApiConsumes('multipart/form-data')
    // Use FileInterceptor to handle file upload
    @UseInterceptors(FileInterceptor('image'))
    // Define the request body schema for Swagger documentation
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                localisation: { type: 'string' },
                etat: { type: 'string', enum: ['PENDING', 'ACTIVE'] },
                image: {
                    type: 'string',
                    format: 'binary',
                },
            },
            required: ['name', 'localisation', 'etat', 'image'],
        },
    })
    /**
     * Create a new chasse.
     * @param {ChasseDto} body - Corps de la requête contenant les informations de la chasse.
     * @param {Multer.File} image - Fichier image uploadé.
     * @param {Request} req - Objet de la requête Express.
     * @param {Response} response - Objet de réponse Express.
     * @returns {void}.
     */
    async createChasse(
        @Body() body: ChasseDto,
        @UploadedFile() image: Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // Extract token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).send({ message: 'Unauthorized' });
        }

        // Verify token and get user info
        const userInfo = await this.jwtService.verifyAsync(token);
        const user = await this.userService.getUser(userInfo.sub);

        // Create the chasse using the ChasseService, including the image as a Buffer and linking to the partenaire
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