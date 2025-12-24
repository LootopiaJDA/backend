import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { ChasseService } from "src/services/chasse.service";
import { ChasseController } from "src/controllers/chasse.controller";

@Module({
  imports: [],
  controllers: [ChasseController],
  providers: [PrismaService, ChasseService],
  exports: []
})
export class ChasseModule {}
