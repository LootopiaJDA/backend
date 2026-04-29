
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Etape } from 'src/generated/prisma/client';
import { UserChasse } from '@prisma/client';

@Injectable()
export class EtapeService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllEtapes(): Promise<Etape[]> {
        const etapes = await this.prisma.etape.findMany();
        return etapes
    }

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

    async updateEtape(idEtape: number,idChasse: number,data: Omit<Etape, 'id' | 'created_at' | 'updated_at' | 'chasse_id'>): Promise<void> {
        await this.prisma.etape.update({
            where: { id: idEtape, chasse_id: idChasse },
            data: {
                ...data
            }
        });
    }

    async deleteEtape(idEtape: number): Promise<void | null> {
        await this.prisma.etape.delete({
            where : {id: idEtape}
        })
    }

    async getUserChasseId(idUser: number, idChasse: number): Promise<UserChasse[]> {
        const userChasseEtapes = await this.prisma.userChasse.findFirst({
            where: {
                id_chasse: idChasse,
                id_user: idUser,
            },
        });
        return userChasseEtapes ? [userChasseEtapes] : [];
    }

    async validateEtape(idEtape: number, idUserChasse: number): Promise<void> {
        await this.prisma.userChasseEtape.create({
            data: {
                id_etape: idEtape,
                id_userchasse: idUserChasse,
                reached_at: new Date()
            }
        });
    }
}
