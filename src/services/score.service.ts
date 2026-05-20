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
                    increment: 100
                }
            }
        });
    }

    incrementScore(userId: number, chasseId: number) {
        return this.prisma.scoreBoard.upsert({
            where: {
                id_user_id_chasse: { id_user: userId, id_chasse: chasseId },
            },
            create: { id_user: userId, id_chasse: chasseId, score: 100 },
            update: { score: { increment: 100 } },
        });
    }

    async syncScore(userId: number, chasseId: number) {
        const userChasse = await this.prisma.userChasse.findFirst({
            where: { id_user: userId, id_chasse: chasseId },
            include: { UserChasseEtape: true },
        });
        const score = (userChasse?.UserChasseEtape?.length ?? 0) * 100;
        return this.prisma.scoreBoard.upsert({
            where: { id_user_id_chasse: { id_user: userId, id_chasse: chasseId } },
            create: { id_user: userId, id_chasse: chasseId, score },
            update: { score },
        });
    }

    async getScoresByChasse(chasseId: number) {
        const [scores, userChasses] = await Promise.all([
            this.prisma.scoreBoard.findMany({
                where: { id_chasse: chasseId },
                orderBy: { score: 'desc' },
                include: { user: { select: { id_user: true, username: true } } },
            }),
            this.prisma.userChasse.findMany({
                where: { id_chasse: chasseId },
                select: { id_user: true, started_at: true, completed_at: true },
            }),
        ]);

        return scores.map(s => {
            const uc = userChasses.find(u => u.id_user === s.id_user);
            const durationMs = uc?.completed_at && uc?.started_at
                ? uc.completed_at.getTime() - uc.started_at.getTime()
                : null;
            return { ...s, durationMs };
        }).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.durationMs === null) return 1;
            if (b.durationMs === null) return -1;
            return a.durationMs - b.durationMs;
        });
    }
}
