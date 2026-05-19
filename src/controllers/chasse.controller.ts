import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ApiTags, ApiBody, ApiConsumes, ApiQuery } from "@nestjs/swagger";
import { Roles } from "src/decorators/role.decorator";
import { RolesGuard } from "src/guards/roles.guard";
import { AuthGuard } from "src/guards/auth.guard";
import { ChasseDto } from "src/dto/chasse.dto";
import { ChasseService } from "src/services/chasse.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Statuts } from "src/decorators/statut-partenaire.decorator";
import { StatutPartenerGuard } from "src/guards/partenaire.guard";
import { Statut } from "src/generated/prisma/browser";
import { ChasseOwnershipGuard } from "src/guards/ChasseOwnershipGuard.guard";
import { v2 as cloudinary } from "cloudinary";
import { Role } from "src/generated/prisma/enums";
import { ChasseOccurrenceDto } from "src/dto/chasseOccurence.dto";
import { UserChasseService } from "src/services/userChasse.service";

interface RequestWithUser extends Request {
  user: {
    sub: number;
    partenaire?: {
      id_partenaire: number;
    };
  };
}

@ApiTags("Partie chasse")
@Controller("chasse")
@Statuts(Statut.ACTIVE)
@UseGuards(AuthGuard)
export class ChasseController {
  // Must inject services to access them
  constructor(
    private readonly chasseService: ChasseService,
    private readonly userChasseService: UserChasseService,
  ) {}

  @Get()
  @ApiQuery({ name: "partenaire", required: false })
  @ApiQuery({ name: "localisation", required: false })
  async getAllChasse(
    @Query("partenaire") part: number,
    @Query("localisation") localisation: string,
    @Res() res: Response,
  ): Promise<Response> {
    if (part) {
      const chasseByPart = await this.chasseService.getChasseByPartenair(
        Number(part),
      );
      return res.status(200).json({ chasseByPart });
    } else {
      const allChasse = await this.chasseService.getAllChasse(localisation);
      return res.status(200).json({ allChasse });
    }
  }
  @Get("me")
  @ApiConsumes("application/json")
  @UseGuards(AuthGuard)
  async getPlayerChasses(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const user = req.user;
    try {
      const userId = Number(user.sub);
      const chasses = await this.userChasseService.getUserChasses(userId);
      return res.status(200).send({ chasses });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error fetching player chasses", error });
    }
  }

  @Get("/:id")
  async getChasseById(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const chasse = await this.chasseService.getChasseById(Number(id));

      if (!chasse) {
        return res.status(404).send({ message: "Chasse not found" });
      }
      return res.status(200).send({
        name: chasse.name,
        localisation: chasse.localisation,
        etat: chasse.etat,
        image: chasse.image,
        occurence: chasse.occurence,
        etape: chasse.etape,
      });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error retrieving chasse", error });
    }
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        localisation: { type: "string" },
        etat: { type: "string", enum: ["PENDING", "ACTIVE"] },
        longitude: { type: "number" },
        latitude: { type: "number" },
        occurrence: {
          type: "object",
          properties: {
            date_end: { type: "string" },
            date_start: { type: "string" },
            limit_user: { type: "integer" },
          },
          required: ["date_end", "date_start", "limit_user"],
        },
        image: {
          type: "string",
          format: "binary",
        },
      },
      required: ["name", "localisation", "etat", "occurrence", "image"],
    },
  })
  @Roles(Role.PARTENAIRE)
  @UseGuards(StatutPartenerGuard, RolesGuard)
  /**
   * Create a new chasse.
   * @param {ChasseDto} body - Corps de la requête contenant les informations de la chasse.
   * @param {any} image - Fichier image uploadé.
   * @param {Request} req - Objet de la requête Express.
   * @param {Response} response - Objet de réponse Express.
   * @returns {void}.
   */
  async createChasse(
    @Body() body: ChasseOccurrenceDto,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() image: any,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const user = req.user;
    if (!user.partenaire) {
      return res
        .status(400)
        .send({ message: "User partenaire information is missing" });
    }
    try {
      const base64Image = `data:${image.mimetype};base64,${image.buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        public_id: "chasse_" + Date.now(),
        folder: "chasses",
      });

      cloudinary.url(uploadResult.public_id, {
        fetch_format: "auto",
        quality: "auto",
      });

      const occ = JSON.parse(body.occurrence);

      isValidDate(occ.date_start);
      isValidDate(occ.date_end);

      if (!isValidDate(occ.date_start) || !isValidDate(occ.date_end)) {
        return res.status(400).send({
          message:
            "Invalid date format for occurrence. Expected format: YYYY-MM-DD",
        });
      }

      await this.chasseService.createChasse(
        {
          name: body.name,
          localisation: body.localisation.toUpperCase(),
          etat: body.etat,
          image: uploadResult.secure_url,
          longitude: parseFloat(body.longitude),
          latitude: parseFloat(body.latitude),
          partenaire: {
            connect: {
              id_partenaire: Number(user.partenaire.id_partenaire),
            },
          },
        },
        {
          date_start: new Date(occ.date_start),
          date_end: new Date(occ.date_end),
          limit_user: occ.limit_user,
          chasse: {
            connect: { id_chasse: occ.chasse_id },
          },
        },
      );

      return res.status(201).send({
        message: "Chasse created",
        imageUrl: uploadResult.secure_url,
      });
    } catch (error) {
      console.error("Erreur Cloudinary:", error);
      return res.status(500).send({
        message: "Erreur lors de l'upload",
        error,
      });
    }
  }

  @ApiConsumes("application/json")
  @Roles(Role.PARTENAIRE)
  @UseGuards(RolesGuard, ChasseOwnershipGuard, StatutPartenerGuard)
  @ApiBody({ type: ChasseDto })
  @Patch(":id")
  async updateChasse(
    @Param("id") id: string,
    @Body() body: ChasseDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.chasseService.updateChasse(Number(id), {
        name: body.name,
        localisation: body.localisation,
        etat: body.etat,
        longitude: parseFloat(body.longitude),
        latitude: parseFloat(body.latitude),
      });
      return res.status(200).send({ message: "Chasse updated" });
    } catch (error) {
      return res.status(500).send({ message: "Error updating chasse", error });
    }
  }

  @Roles(Role.PARTENAIRE)
  @UseGuards(RolesGuard, ChasseOwnershipGuard, StatutPartenerGuard)
  @Delete(":id")
  async deleteChasse(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.chasseService.deleteChasse(Number(id));
      return res.status(200).send({ message: "Chasse deleted" });
    } catch (error) {
      return res.status(500).send({ message: "Error deleting chasse", error });
    }
  }

  @Patch(":id/complete")
  @ApiConsumes("application/json")
  @Roles(Role.JOUEUR)
  @UseGuards(AuthGuard)
  async completeChasse(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      await this.userChasseService.completeChasse(Number(id), req.user.sub);
      return res.status(200).send({ message: "Chasse completed" });
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error completing chasse", error });
    }
  }

  @Post(":id/join")
  @ApiConsumes("application/json")
  @Roles(Role.JOUEUR)
  @UseGuards(AuthGuard)
  async inscriptionChasse(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<Response> {
    const user = req.user;
    try {
      if(!await this.userChasseService.getUserInscription(Number(id), user.sub)) {
        await this.userChasseService.inscriptionChasse(Number(id), user.sub);
        return res.status(200).send({ message: "Inscription successful" });
      } else {
        await this.userChasseService.changeState(Number(id), user.sub);
        return res.status(200).send({ message: "State changed successfully" });
      }
    } catch (error) {
      return res
        .status(500)
        .send({ message: "Error during inscription", error });
    }
  }

  @Patch(":idChasse/leave")
  @ApiConsumes("application/json")
  @Roles(Role.JOUEUR)
  @UseGuards(AuthGuard)
  async leaveChasse(@Param("idChasse") id: string,@Req() req: RequestWithUser,@Res() res: Response,): Promise<Response> {
    const user = req.user;
    try {
      await this.userChasseService.leaveChasse(Number(id), user.sub);
      return res.status(200).send({ message: "Left chasse successfully" });
    } catch (error) {
      return res.status(500).send({ message: "Error leaving chasse", error });
    }
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
