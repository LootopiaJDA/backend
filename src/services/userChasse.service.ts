import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { User, Chasse, UserChasse } from "../generated/prisma/client";
import { ChasseService } from "./chasse.service";

@Injectable()
export class UserChasseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chasseService: ChasseService,
  ) {}

  async inscriptionChasse(chasseId: number, userId: number): Promise<void> {
    const existing = await this.chasseService.getChasseById(chasseId);
    if (!existing) {
      throw new Error("Chasse not found");
    }
    await this.prisma.userChasse.create({
      data: {
        id_user: userId,
        id_chasse: chasseId,
        statut: "IN_PROGRESS",
      },
    });
  }

  async getUserChasses(idChasse: number): Promise<UserChasse[]> {
    const userChasses = await this.prisma.userChasse.findMany({
      where: { id_chasse: idChasse },
    });
    return userChasses;
  }
}
