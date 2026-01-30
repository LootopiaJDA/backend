import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Chasse, Prisma } from 'src/generated/prisma/client';
import { ChasseOccurrenceDto } from 'src/dto/chasseOccurence.dto';


@Injectable()
export class ChasseService {
  constructor(private readonly prisma: PrismaService) {}
  // data is an object, need to use Prisma.ChasseCreateInput type for type safety
  async createChasse(data: Prisma.ChasseCreateInput, occurrenceData: Prisma.OccurenceCreateInput): Promise<void> {
    this.prisma.$transaction(async (tx) => {
      const chasse = await tx.chasse.create({ data });
      await tx.occurence.create({
        data: {
          date_start: occurrenceData.date_start,
          date_end: occurrenceData.date_end,
          limit_user: occurrenceData.limit_user,
          chasse: {
            connect: { id_chasse: chasse.id_chasse },
          },
        },
      });
    });
  }

  async updateChasse(id: number, data: Prisma.ChasseUpdateInput): Promise<void> {
    await this.prisma.chasse.update({
      where: { id_chasse: id },
      data,
    });
  }

  async getChasseById(id: number): Promise<Chasse | null> {
    return await this.prisma.chasse.findUnique({ where: { id_chasse: id } });
  }

  async getAllChasse(): Promise<Chasse[] | null> {
    return await this.prisma.chasse.findMany({where:{etat: "ACTIVE"}})
  }

  async getChasseByPartenair(id: number): Promise<Chasse[] | null> {
    return await this.prisma.chasse.findMany({where: {idPartenaire: id}})
  }

  async deleteChasse(id: number): Promise<void> {
    await this.prisma.chasse.delete({ where: { id_chasse: id } });
  }
}