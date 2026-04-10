import { Partenaire } from "src/generated/prisma/client";
import { PrismaService } from "./prisma.service";
import { Injectable } from "@nestjs/common";
import { Statut } from "src/generated/prisma/browser";

@Injectable()
export class PartenaireService {
  constructor(private readonly prisma: PrismaService) {}

  async getPartenaireByUserId(idPartenaire: number): Promise<Partenaire | null> {
    return this.prisma.partenaire.findFirst({
      where: { id_partenaire: idPartenaire },
    });
  }

  async getAll(): Promise<Partenaire[]> {
    return this.prisma.partenaire.findMany();
  }

  async updateStatut(id: number, statut: Statut): Promise<Partenaire> {
    return this.prisma.partenaire.update({
      where: { id_partenaire: id },
      data: { statut },
    });
  }
}
