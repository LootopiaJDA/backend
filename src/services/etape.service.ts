
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Etape, Prisma } from 'src/generated/prisma/client';
import { connect } from 'http2';

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
}
