import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  // Lock CORS to the configured browser origin(s) in production (comma-separated
  // allowlist); reflect any origin when unset, which keeps local dev frictionless.
  const corsOrigin = config.get<string>("CORS_ORIGIN");
  app.enableCors({ origin: corsOrigin ? corsOrigin.split(",").map((o) => o.trim()) : true });
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Banking Dashboard API")
    .setDescription("Accounts, transactions, transfers and external (Paystack) funding flows.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  const port = config.get<number>("PORT", 3001);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port} (docs at /docs)`);
}

void bootstrap();
