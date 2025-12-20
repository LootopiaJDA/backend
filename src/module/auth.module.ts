import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserModule } from "./user.module";
import { PrismaService } from "../services/prisma.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [UserModule, JwtModule.register({
    global: true,
      secret: process.env.JWT_SECRET || 'defaultsecret',
      signOptions: { expiresIn: '60s' },
  })],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
