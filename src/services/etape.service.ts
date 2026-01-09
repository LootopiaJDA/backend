
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Etape } from 'src/generated/prisma/client';

@Injectable()
export class EtapeService {
    constructor(private readonly prisma: PrismaService) { }

    async getEtapeChasse(id: number): Promise<Etape[] | null> {
        const etape = await this.prisma.etape.findMany({
            where: {
                chasse_id: id
            }
        })
        return etape
    }

    async getSingleEtape(id: number): Promise<Etape | null>{
        const singleEtape = await this.prisma.etape.findFirst({
            where : {id:id}
        })
        return singleEtape
    }

    
    async createEtape(
        chasseId: number,
        data: Omit<Etape, 'id' | 'created_at' | 'updated_at' | 'chasse_id'>
    ): Promise<void> {
        await this.prisma.etape.create({
            data: {
                ...data,
                chasse: {
                    connect: { id_chasse: chasseId }
                }
            }
        });
    }

    async deleteEtape(idEtape: number): Promise<void | null> {
        await this.prisma.etape.delete({
            where : {id: idEtape}
        })
    }
}
