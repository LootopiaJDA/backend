import { Body, Controller, Get, Post, Patch, Req, Res, UploadedFile, UseGuards, UseInterceptors, Param, Delete } from "@nestjs/common";
import type { Request, Response } from 'express';
import { ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
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
import { StatutPartenerGuard } from "src/guards/partenaire.guard";
import { Statut } from "src/generated/prisma/browser";
import { ChasseOwnershipGuard } from "src/guards/ChasseOwnershipGuard.guard";
import { v2 as cloudinary } from 'cloudinary';




@ApiTags('Chasse')
@ApiBearerAuth('access-token')
@Controller('chasse')
@Roles(Role.PARTENAIRE)
@Statuts(Statut.ACTIVE)
@UseGuards(AuthGuard, RolesGuard, StatutPartenerGuard)
export class ChasseController {
    // Must inject services to access them
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly chasseService: ChasseService
    ) { }

    @UseGuards(ChasseOwnershipGuard)
    @Get('/:id')
    async getChasseById(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            const chasse = await this.chasseService.getChasseById(Number(id));

            if (!chasse) {
                return res.status(404).send({ message: 'Chasse not found' });
            }
            return res.status(200).send({
                nom: chasse.name,
                localisation: chasse.localisation,
                etat: chasse.etat,
            });
        } catch (error) {
            return res.status(500).send({ message: 'Error retrieving chasse', error });
        }
    }

    @Get('/image/:id')
    async getChasseImageById(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            const chasse = await this.chasseService.getChasseById(Number(id));

            if (!chasse) {
                return res.status(404).send({ message: 'Chasse not found' });
            }
            res.setHeader('Content-Type', 'image/jpeg');
            return res.status(200).send(Buffer.from(chasse.image));
        } catch (error) {
            return res.status(500).send({ message: 'Error retrieving chasse', error });
        }
    }

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

    try {
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            public_id: 'chasse_' + Date.now(),
            folder: 'chasses', 
        });

        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: 'auto',
            quality: 'auto'
        });

        console.log('Upload réussi:', uploadResult.secure_url);
        console.log(optimizeUrl);

        // Create the chasse using the ChasseService
        await this.chasseService.createChasse({
            name: body.name,
            localisation: body.localisation,
            etat: body.etat,
            image:  uploadResult.secure_url, // ou imageUrl: uploadResult.secure_url
            partenaire: {
                connect: {
                    id_partenaire: Number(user!.partenerId),
                },
            },
        });

        return res.status(201).send({ 
            message: 'Chasse created',
            imageUrl: uploadResult.secure_url // URL Cloudinary
        });
    } catch (error) {
        console.error('Erreur Cloudinary:', error);
        return res.status(500).send({ 
            message: 'Erreur lors de l\'upload', 
            error: error.message 
        });
    }
}

    @ApiBearerAuth('access-token')
    @ApiConsumes('application/json')
    @UseGuards(ChasseOwnershipGuard)
    @ApiBody({ type: ChasseDto })
    @Patch('update/:id')
    async updateChasse(@Param('id') id: string, @Body() body: ChasseDto, @Res() res: Response): Promise<Response> {
        try {
            await this.chasseService.updateChasse(Number(id), {
                name: body.name,
                localisation: body.localisation,
                etat: body.etat
            });
            return res.status(200).send({ message: 'Chasse updated' });
        } catch (error) {
            return res.status(500).send({ message: 'Error updating chasse', error });
        }
    }

    @ApiBearerAuth('access-token')
    @UseGuards(ChasseOwnershipGuard)
    @Delete('delete/:id')
    async deleteChasse(@Param('id') id: string, @Res() res: Response): Promise<Response> {
        try {
            await this.chasseService.deleteChasse(Number(id));
            return res.status(200).send({ message: 'Chasse deleted' });
        } catch (error) {
            return res.status(500).send({ message: 'Error deleting chasse', error });
        }
    }
}