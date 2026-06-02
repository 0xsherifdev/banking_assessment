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
      useFactory: (config: ConfigService) =>
        new Redis({
          host: config.get<string>("REDIS_HOST", "localhost"),
          port: config.get<number>("REDIS_PORT", 6379),
        }),
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
