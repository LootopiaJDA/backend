import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { ScoreController } from "src/controllers/score.controller";
import { ScoreService } from "src/services/score.service";


@Module({
  imports: [],
  controllers: [ScoreController],
  providers: [ScoreService, PrismaService],
  exports: [ScoreService]
})
export class ScoreModule {}
