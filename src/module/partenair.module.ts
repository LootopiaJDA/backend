import { Module } from "@nestjs/common";
import { PrismaService } from "../services/prisma.service";
import { PartenaireService } from "src/services/partenaire.service";
import { PartenaireController } from "src/controllers/partenaire.controller";

@Module({
  imports: [],
  controllers: [PartenaireController],
  providers: [PrismaService, PartenaireService],
  exports: [PartenaireService],
})
export class PartenaireModule {}
