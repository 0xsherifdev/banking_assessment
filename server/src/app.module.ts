import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AccountsModule } from "./accounts/accounts.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { AllExceptionsFilter } from "./common/exceptions/all-exceptions.filter";
import { validate } from "./config/env.validation";
import { DrizzleModule } from "./db/drizzle.module";
import { HealthModule } from "./health/health.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate, envFilePath: [".env"] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DrizzleModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AccountsModule,
    TransactionsModule,
  ],
  providers: [
    // Order matters: rate-limit before authenticating.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
