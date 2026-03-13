import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { ChasseService } from "src/services/chasse.service";
import { ChasseController } from "src/controllers/chasse.controller";
import { UserService } from "src/services/user.service";
import { UserChasseService } from "src/services/userChasse.service";

@Module({
  imports: [],
  controllers: [ChasseController],
  providers: [PrismaService, ChasseService, UserService, UserChasseService],
  exports: [ChasseService]
})
export class ChasseModule {}
