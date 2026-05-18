import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ScoreService {
    constructor(private readonly prisma: PrismaService) {}

    getScores() {
        return this.prisma.scoreBoard.findMany();
    }

    createScore(idJoueur: number, idChasse: string) {
        return this.prisma.scoreBoard.create({
            data: {
                id_user: idJoueur,
                id_chasse: parseInt(idChasse),
                score: 0
            }
        });
    }

    updateScore(idJoueur: number, idChasse: string) {
        return this.prisma.scoreBoard.updateMany({
            where: {
                id_chasse: parseInt(idChasse),
                id_user: idJoueur
            },
            data: {
                score: {
                    increment: 1
                }
            }
        });
    }
}
