import { Module } from "@nestjs/common";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { PrismaService } from "../services/prisma.service";
import { UserModule } from "./user.module";

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
