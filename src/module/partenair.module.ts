import { Module } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { PrismaService } from "../services/prisma.service";
import { PartenaireService } from "src/services/partenaire.service";

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, PartenaireService],
  exports: [PartenaireService]
})
export class PartenaireModule {}
