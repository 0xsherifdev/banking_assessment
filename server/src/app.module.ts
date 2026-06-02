import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./config/env.validation";
import { DrizzleModule } from "./db/drizzle.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate, envFilePath: [".env"] }),
    DrizzleModule,
    HealthModule,
  ],
})
export class AppModule {}
