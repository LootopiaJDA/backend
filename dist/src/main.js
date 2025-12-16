"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Swagger Lootopia")
        .setDescription("End point test fort Lootopia API")
        .setVersion("1.0")
        .addTag("Lootopia")
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, documentFactory);
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
//# sourceMappingURL=main.js.map