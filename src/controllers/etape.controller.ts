import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  Delete,
  ParseIntPipe,
  HttpException,
  HttpStatus,
  Patch,
  Query,
} from "@nestjs/common";
import { Response } from "express";
import {
  ApiBody,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "src/guards/auth.guard";
import { EtapeService } from "../services/etape.service";
import { Roles } from "src/decorators/role.decorator";
import { ChasseOwnershipGuard } from "src/guards/ChasseOwnershipGuard.guard";
import { EtapeDto } from "src/dto/etape.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Multer } from "multer";
import { v2 as cloudinary } from "cloudinary";
import { ForbiddenException } from "src/common/ForbiddenExc";

@ApiTags("Etape")
@ApiInternalServerErrorResponse({ description: "Internal Server Error" })
@Controller("etape")
@UseGuards(AuthGuard)
export class EtapeController {
  constructor(private readonly etape: EtapeService) {}

  @Get("/")
  @Roles("JOUEUR")
  @ApiQuery({ name: "idChasse", required: false })
  @ApiQuery({ name: "idEtape", required: false })
  async getEtapeByChasse(
    @Query("idChasse") idChasse: string,
    @Query("idEtape") idEtape: string,
    @Res() response: Response,
  ): Promise<Response> {
    const caseKey = (idChasse ? 2 : 0) + (idEtape ? 1 : 0);

    switch (caseKey) {
      case 0: {
        // aucun param
        const allEtapes = await this.etape.getAllEtapes();
        return response
          .status(200)
          .json(
            allEtapes.length !== 0 ? allEtapes : { message: "No etape found" },
          );
      }
      case 1: {
        // idEtape seulement
        const etape = await this.etape.getSingleEtape(Number(idEtape));
        if (etape) return response.status(200).json(etape);
        return response.status(404).json({ message: "Etape not found" });
      }
      case 2: {
        // idChasse seulement
        const etape = await this.etape.getEtapeChasse(Number(idChasse));
        if (etape) return response.status(200).json(etape);
        return response.status(404).json({ message: "Etape not found" });
      }
      case 3: {
        // idChasse + idEtape
        const etapes = await this.etape.getEtapeChasse(Number(idChasse));
        if (etapes) {
          const filteredEtape = etapes.filter((e) => e.id === Number(idEtape));
          if (filteredEtape.length > 0) {
            return response.status(200).json(filteredEtape[0]);
          }
          return response
            .status(404)
            .json({ message: "Etape not found in this chasse" });
        }
        break;
      }
      default:
        return response.status(400).json({ message: "Invalid parameters" });
    }
    return response
      .status(400)
      .json({ message: "idChasse or idEtape query parameter is required" });
  }

  @Post(":id")
  @Roles("PARTENAIRE")
  @UseGuards(ChasseOwnershipGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  @ApiBody({
    description: "Créer une étape avec image",
    type: EtapeDto,
  })
  async createEtape(
    @Param("id") id: string,
    @Body() body: Omit<EtapeDto, "updated_at" | "created_at" | "chasse_id">,
    @UploadedFile() image: Multer.file,
  ): Promise<void> {
    if (!image) {
      throw new HttpException("Image is required", HttpStatus.BAD_REQUEST, {
        cause: new Error("Image is required"),
      });
    }

    const base64Image = `data:${image.mimetype};base64,${image.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      public_id: "etape_" + "chasse_" + id + "_" + Date.now(),
      folder: "etape",
    });

    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    body.image = optimizeUrl;
    body.rayon = Number(typeof body.rayon === "string" && body.rayon);
    body.rank = Number(typeof body.rank === "string" && body.rank);
    try {
      await this.etape.createEtape(Number(id), body);
    } catch (exc) {
      throw new ForbiddenException(
        "You are not allowed to create an etape for this chasse",
      );
    }
  }

  @Patch(":idChasse/:idEtape")
  @Roles("PARTENAIRE")
  @UseGuards(ChasseOwnershipGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  @ApiBody({
    description: "Mettre à jour une étape avec image",
    type: EtapeDto,
  })
  async updateEtape(
    @Param("idChasse", ParseIntPipe) idChasse: number,
    @Param("idEtape", ParseIntPipe) idEtape: number,
    @Body() body: Omit<EtapeDto, "updated_at" | "created_at" | "chasse_id">,
    @UploadedFile() image: Multer.file,
    @Res() res: Response,
  ): Promise<Response> {
    if (image) {
      const base64Image = `data:${image.mimetype};base64,${image.buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        public_id: "etape_update_" + "chasse_" + idChasse + "_" + Date.now(),
        folder: "etape",
      });

      const optimizeUrl = cloudinary.url(uploadResult.public_id, {
        fetch_format: "auto",
        quality: "auto",
      });

      body.image = optimizeUrl;
    }

    body.rayon = Number(typeof body.rayon === "string" && body.rayon);
    body.rank = Number(typeof body.rank === "string" && body.rank);

    try {
      await this.etape.updateEtape(idEtape, idChasse, body);
      return res.status(200).json({ message: "Etape updated successfully" });
    } catch (exc) {
      throw new ForbiddenException("You are not allowed to update this etape");
    }
  }

  @Delete(":idChasse/:idEtape")
  @UseGuards(ChasseOwnershipGuard)
  @Roles("PARTENAIRE")
  async deleteEtape(
    @Param("idChasse", ParseIntPipe) idChasse: number,
    @Param("idEtape", ParseIntPipe) idEtape: number,
    @Res() res: Response,
  ): Promise<Response> {
    const existingEtape = await this.etape.getSingleEtape(idEtape);
    if (existingEtape) {
      await this.etape
        .deleteEtape(idEtape)
        .then(async () => {
          const regex = /\/v\d+\/(.+?)(?:\?|$)/;
          const match = existingEtape.image.match(regex);
          const publicId = match ? match[1] : null;

          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          } else {
            throw new HttpException(
              "Image does not exist",
              HttpStatus.NOT_FOUND,
              {
                cause: new Error("Image does not exist"),
              },
            );
          }
        })
        .catch((exc) => {
          throw new HttpException(
            "Error during deletion",
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
              cause: new Error("Error during deletion: " + exc.message),
            },
          );
        });
    }
    return res.sendStatus(200);
  }
}
