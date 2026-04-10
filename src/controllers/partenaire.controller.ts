import { Body, Controller, Get, Param, Patch, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuthGuard } from "src/guards/auth.guard";
import { RolesGuard } from "src/guards/roles.guard";
import { Roles } from "src/decorators/role.decorator";
import { Role } from "src/generated/prisma/enums";
import { Statut } from "src/generated/prisma/browser";
import { PartenaireService } from "src/services/partenaire.service";

@ApiTags("Partenaire")
@Controller("partenaire")
@UseGuards(AuthGuard)
export class PartenaireController {
  constructor(private readonly partenaireService: PartenaireService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAll(@Res() res: Response): Promise<Response> {
    try {
      const partenaires = await this.partenaireService.getAll();
      return res.status(200).json(partenaires);
    } catch (error) {
      return res.status(500).json({ message: "Erreur récupération partenaires", error: error.message });
    }
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateStatut(
    @Param("id") id: string,
    @Body("statut") statut: Statut,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const updated = await this.partenaireService.updateStatut(Number(id), statut);
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Erreur mise à jour statut", error: error.message });
    }
  }
}
