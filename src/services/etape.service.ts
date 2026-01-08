
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Etape } from 'src/generated/prisma/client';

@Injectable()
export class EtapeService {
  constructor(private readonly prisma: PrismaService){}

  async getEtapeChasse(id: number): Promise<Etape[] | null>{
    const etape = await this.prisma.etape.findMany({
        where: {
            chasse_id : id
        }
    })
    return etape
  }
}
