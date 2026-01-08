import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { ChasseService } from "../services/chasse.service";
import { UserService } from "../services/user.service";
import { EtapeController } from "../controllers/etape.controller";
import { EtapeService } from "../services/etape.service";

@Module({
  imports: [],
  controllers: [EtapeController],
  providers: [PrismaService, ChasseService, UserService, EtapeService],
  exports: []
})
export class EtapeModule {}
