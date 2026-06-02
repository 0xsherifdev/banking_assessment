import { Inject, Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS } from "./redis.constants";

/**
 * Thin JSON cache over Redis. All reads/writes fail open (a Redis hiccup degrades
 * to a cache miss, never an error) — the cache is an optimisation, not a source
 * of truth.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      this.logger.warn(`cache get failed (${key}): ${String(err)}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      this.logger.warn(`cache set failed (${key}): ${String(err)}`);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn(`cache del failed: ${String(err)}`);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const found: string[] = [];
      const stream = this.redis.scanStream({ match: pattern, count: 100 });
      for await (const batch of stream) {
        found.push(...(batch as string[]));
      }
      if (found.length > 0) {
        await this.redis.del(...found);
      }
    } catch (err) {
      this.logger.warn(`cache delByPattern failed (${pattern}): ${String(err)}`);
    }
  }
}
