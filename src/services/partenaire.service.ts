import { Partenaire } from "src/generated/prisma/client";
import { PrismaService } from "./prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PartenaireService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getPartenaireByUserId(idPartenaire: number): Promise<Partenaire | null> {
    return this.prisma.partenaire.findFirst({
      where: { id_partenaire: idPartenaire },
    });
  }
}
