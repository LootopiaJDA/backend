import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class ChasseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.chasse.findUnique({
      where: { id_chasse: id },
      select: {
        name: true,
        localisation: true,
        etat: true,
        image: true,
        idPartenaire: true,
        occurence: {
          select: {
            date_start: true,
            date_end: true,
            limit_user: true,
          },
        },
        etape: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            lat: true,
            long: true,
            address: true,
            rayon: true,
            rank: true,
          },
        },
      },
    });
  }

}