import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { CacheService } from "./cache.service";
import { REDIS } from "./redis.constants";

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // A full connection string (REDIS_URL) wins — it carries auth, db index
        // and TLS (rediss://), which managed/hosted Redis (e.g. Coolify) require.
        // Otherwise fall back to discrete host/port for local dev.
        const url = config.get<string>("REDIS_URL");
        return url
          ? new Redis(url)
          : new Redis({
              host: config.get<string>("REDIS_HOST", "localhost"),
              port: config.get<number>("REDIS_PORT", 6379),
            });
      },
    },
    CacheService,
  ],
  exports: [REDIS, CacheService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
