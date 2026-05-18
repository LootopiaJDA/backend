
import { Controller, Get, UseGuards, Patch, Param, Res, Post, Req} from '@nestjs/common';
import { Roles } from 'src/decorators/role.decorator';
import { Role, ScoreBoard } from 'src/generated/prisma/browser';
import { RolesGuard } from 'src/guards/roles.guard';
import { ScoreService } from 'src/services/score.service';
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from 'src/guards/auth.guard';
import type { Response } from "express";
import { RequestWithUser } from 'src/interface/user.interface';

@ApiTags('Partie score')
@Controller('scores')
@UseGuards(AuthGuard)
export class ScoreController {

    constructor(private readonly scoreService: ScoreService) {}

    @Roles(Role.JOUEUR)
    @UseGuards(RolesGuard)
    @Get()
    async getScores(): Promise<ScoreBoard[]> {
        return await this.scoreService.getScores();
    }

    @Roles(Role.JOUEUR)
    @UseGuards(RolesGuard)
    @Post('/:idChasse')
    async createScore(@Param('idChasse') idChasse: string, @Res() response: Response, @Req() req: RequestWithUser): Promise<Response> {
        const user = req.user; 
        await this.scoreService.createScore(user.sub, idChasse);
        return response.status(201).json("Score créé");
    }

    @Roles(Role.JOUEUR)
    @UseGuards(RolesGuard)
    @Patch('/:idChasse')
    async updateScore(@Param('idChasse') idChasse: string, @Res() response: Response, @Req() req: RequestWithUser): Promise<Response> {
        const user = req.user; 
        await this.scoreService.updateScore(user.sub, idChasse);
        return response.status(200).json("Score mis à jour");
    }
}
