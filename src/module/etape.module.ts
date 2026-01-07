import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { ChasseService } from "src/services/chasse.service";
import { UserService } from "src/services/user.service";

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, ChasseService, UserService],
  exports: []
})
export class EtapeModule {}
