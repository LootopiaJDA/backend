import { Module } from "@nestjs/common";
import { UserModule } from "./user.module";
import { AuthModule } from "./auth.module";
import { ChasseModule } from "./chasse.module";
import { PartenaireModule } from "./partenair.module";
import { EtapeModule } from "./etape.module";

@Module({
  imports: [UserModule, AuthModule, ChasseModule, PartenaireModule, EtapeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
