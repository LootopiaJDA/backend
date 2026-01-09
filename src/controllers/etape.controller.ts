import { Body, Controller, Get, Post, UseGuards, Param, Res, UploadedFile, UseInterceptors, Delete, ParseIntPipe, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { EtapeService } from "../services/etape.service";
import { Roles } from "src/decorators/role.decorator";
import { ChasseOwnershipGuard } from "src/guards/ChasseOwnershipGuard.guard";
import { EtapeDto } from "src/dto/etape.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Multer } from 'multer';
import { v2 as cloudinary } from 'cloudinary';



@ApiTags('Etape')
@Controller('etape')
@UseGuards(AuthGuard)
export class EtapeController {
    // Must inject services to access them
    constructor(private readonly etape: EtapeService) { }

    @Get(':id')
    @Roles('JOUEUR')
    async getEtapeByChasse(@Param('id') id: string, @Res() response: Response): Promise<Response> {
        const etape = await this.etape.getEtapeChasse(Number(id));

        if (etape) return response.status(200).json(etape.length !== 0 ? etape : { message: "No etape found" })
        return response.status(500).json({ message: "Serveur error" })
    }

    @Post(':id')
    @Roles('PARTENAIRE')
    @UseGuards(ChasseOwnershipGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    @ApiBody({
        description: 'Créer une étape avec image',
        type: EtapeDto,
    })
    async createEtape(@Param('id') id: string, @Body() body: Omit<EtapeDto, 'updated_at' | 'created_at' | 'chasse_id'>, @UploadedFile() image: Multer.file): Promise<void> {
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            public_id: ('etape_' + 'chasse_' + id + '_') + Date.now(),
            folder: 'etape',
        });

        const optimizeUrl = cloudinary.url(uploadResult.public_id, {
            fetch_format: 'auto',
            quality: 'auto'
        });

        body.image = optimizeUrl
        body.rayon = Number(typeof body.rayon === "string" && body.rayon)
        body.rank = Number(typeof body.rank === "string" && body.rank)

        await this.etape.createEtape(Number(id), body)
    }

    @Delete(':idChasse/:idEtape')
    @UseGuards(ChasseOwnershipGuard)
    @Roles('PARTENAIRE')
    async deleteEtape(@Param('idChasse', ParseIntPipe) idChasse: number, @Param('idEtape', ParseIntPipe) idEtape: number, @Res() res: Response): Promise<Response> {
        const existingEtape = await this.etape.getSingleEtape(idEtape)
        if (existingEtape) {
            await this.etape.deleteEtape(idEtape).then(async () => {
                const regex = /\/v\d+\/(.+?)(?:\?|$)/;
                const match = existingEtape.image.match(regex);
                const publicId = match ? match[1] : null;

                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                } else {
                    throw new HttpException('Image does not exist', HttpStatus.BAD_REQUEST, {
                        cause: new Error('Image does not exist'),
                    })
                }
            });
        }
        return res.sendStatus(200)
    }
}