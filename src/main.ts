import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module/app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { v2 as cloudinary } from 'cloudinary';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: false});

  const config = new DocumentBuilder()
    .setTitle("Swagger Lootopia")
    .setDescription("End point test fort Lootopia API")
    .setVersion("1.0")
    .addTag("Lootopia")
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);

  await app.listen(3000);

  const url = await app.getUrl();
  const swaggerUrl = `${url}/api`;
  const pgAdminUrl = `http://localhost:5050`;
  const postgresUrl = `postgresql://admin:admin@localhost:5432/lootopia`;
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

  cloudinary.config({
    cloud_name: 'dedqcxfgq',
    api_key: '694879155165255',
    api_secret: process.env.API_KEY_CLOUDINARY 
  });
}
void bootstrap();
