import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { AdminController } from "src/controllers/admin.controller";
import { AdminService } from "src/services/admin.service";

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
