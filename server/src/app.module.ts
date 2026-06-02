import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AccountsModule } from "./accounts/accounts.module";
import { AllExceptionsFilter } from "./common/exceptions/all-exceptions.filter";
import { validate } from "./config/env.validation";
import { DrizzleModule } from "./db/drizzle.module";
import { HealthModule } from "./health/health.module";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate, envFilePath: [".env"] }),
    DrizzleModule,
    HealthModule,
    AccountsModule,
    TransactionsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}
