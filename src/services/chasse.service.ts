import { Injectable } from '@nestjs/common';
import { ChasseDto } from 'src/dto/chasse.dto';
import { PrismaService } from './prisma.service';
import { Prisma } from 'src/generated/prisma/client';


@Injectable()
export class ChasseService {
  constructor(private readonly prisma: PrismaService) {}

  async createChasse(data: Prisma.ChasseCreateInput): Promise<void> {
    await this.prisma.chasse.create({ data });
  }
}