import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Chasse, Prisma } from 'src/generated/prisma/client';


@Injectable()
export class ChasseService {
  constructor(private readonly prisma: PrismaService) {}
  // data is an object, need to use Prisma.ChasseCreateInput type for type safety
  async createChasse(data: Prisma.ChasseCreateInput): Promise<void> {
    await this.prisma.chasse.create({ data });
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

  async deleteChasse(id: number): Promise<void> {
    await this.prisma.chasse.delete({ where: { id_chasse: id } });
  }
}