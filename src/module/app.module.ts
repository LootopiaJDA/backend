import { Module } from "@nestjs/common";
import { UserModule } from "./user.module";
import { AuthModule } from "./auth.module";
import { ChasseModule } from "./chasse.module";
import { PartenaireModule } from "./partenair.module";
import { EtapeModule } from "./etape.module";
import { AdminModule } from "./admin.module";

@Module({
  imports: [UserModule, AuthModule, ChasseModule, PartenaireModule, EtapeModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
