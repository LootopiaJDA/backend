import { Module } from "@nestjs/common";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { PrismaService } from "../services/prisma.service";
import { UserRepository } from "src/repository/user.repository";

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, UserRepository],
  exports: [UserService]
})
export class UserModule {}
