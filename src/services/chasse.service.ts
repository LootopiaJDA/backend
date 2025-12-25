import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from 'src/generated/prisma/client';


@Injectable()
export class ChasseService {
  constructor(private readonly prisma: PrismaService) {}
  // data is an object, need to use Prisma.ChasseCreateInput type for type safety
  async createChasse(data: Prisma.ChasseCreateInput): Promise<void> {
    await this.prisma.chasse.create({ data });
  }
}