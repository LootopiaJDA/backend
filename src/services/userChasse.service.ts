import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
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

  async getUserChasses(userId: number) {
    return this.prisma.userChasse.findMany({
      where: { id_user: userId },
      include: {
        UserChasseEtape: true,
        chasse: { select: { id_chasse: true, name: true } },
      },
    });
  }

  async getUserInscription(chasseId: number, userId: number) {
    return this.prisma.userChasse.findMany({
      where: { id_chasse: chasseId, id_user: userId },
    });
  }

  async changeState(chasseId: number, userId: number): Promise<void> {
    const inscription = await this.prisma.userChasse.findFirst({
      where: { id_chasse: chasseId, id_user: userId },
    });
    if (!inscription) throw new Error("Inscription not found");

    // Supprime les étapes validées pour permettre un nouveau départ propre
    await this.prisma.userChasseEtape.deleteMany({
      where: { id_userchasse: inscription.id_userchasse },
    });

    // Remet le score à 0
    await this.prisma.scoreBoard.updateMany({
      where: { id_user: userId, id_chasse: chasseId },
      data: { score: 0 },
    });

    await this.prisma.userChasse.updateMany({
      where: { id_user: userId, id_chasse: chasseId },
      data: { statut: "IN_PROGRESS", completed_at: null, started_at: new Date() },
    });
  }

  async completeChasse(chasseId: number, userId: number): Promise<void> {
    await this.prisma.userChasse.updateMany({
      where: { id_user: userId, id_chasse: chasseId, statut: 'IN_PROGRESS' },
      data: { statut: 'COMPLETED', completed_at: new Date() },
    });
  }

  async leaveChasse(chasseId: number, userId: number): Promise<void> {
    await this.prisma.userChasse.updateMany({
      where: { id_user: userId, id_chasse: chasseId },
      data: { statut: 'ABANDONED' },
    });
  }

}
