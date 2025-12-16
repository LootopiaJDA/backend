import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Swagger Lootopia")
    .setDescription("End point test fort Lootopia API")
    .setVersion("1.0")
    .addTag("Lootopia")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(3000);

  const url = await app.getUrl();
  const swaggerUrl = `${url}/api`;
  const pgAdminUrl = `http://localhost:5050`;
  const postgresUrl = `postgresql://admin:admin@localhost:5433/lootopia`;
  const prismaStudio = "http://localhost:5555";

  console.log(`
-----------------------------------------------------
 🚀 Lootopia Backend is running!
 
 👉 API:             ${url}
 👉 Swagger:         ${swaggerUrl}
 👉 PgAdmin:         ${pgAdminUrl}
 👉 PostgreSQL:      ${postgresUrl}
 👉 PrismaStudio:    ${prismaStudio}

-----------------------------------------------------
  `);
}
void bootstrap();
