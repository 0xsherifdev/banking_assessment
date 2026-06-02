import { createHash } from "crypto";
import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  Logger,
  type NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import Redis from "ioredis";
import { catchError, concatMap, from, type Observable, of, throwError } from "rxjs";
import { ConflictError, ValidationError } from "../../lib/errors";
import { REDIS } from "../../redis/redis.constants";

const LOCK_TTL_SECONDS = 30;
const RESULT_TTL_SECONDS = 60 * 60 * 24;

interface IdempotencyRecord {
  status: "processing" | "completed";
  bodyHash: string;
  httpStatus?: number;
  response?: unknown;
}

/**
 * Honours an optional `Idempotency-Key` header on POST writes so a retried
 * request (network blip, double-click) never applies twice:
 *  - first request acquires a short lock and processes;
 *  - a replay with the same key + body returns the stored response;
 *  - a replay with a *different* body is rejected (422);
 *  - a concurrent in-flight duplicate gets 409.
 * Fails open if Redis is unavailable (processes without dedupe).
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<Request & { user?: { id: number } }>();
    const idempotencyKey = req.header("Idempotency-Key");

    if (req.method !== "POST" || !idempotencyKey) {
      return next.handle();
    }

    const userId = req.user?.id ?? "anon";
    const storeKey = `idem:${userId}:${req.method}:${req.originalUrl}:${idempotencyKey}`;
    const bodyHash = createHash("sha256").update(JSON.stringify(req.body ?? {})).digest("hex");

    let acquired: string | null;
    try {
      acquired = await this.redis.set(
        storeKey,
        JSON.stringify({ status: "processing", bodyHash } satisfies IdempotencyRecord),
        "EX",
        LOCK_TTL_SECONDS,
        "NX"
      );
    } catch (err) {
      this.logger.warn(`idempotency store unavailable, processing without dedupe: ${String(err)}`);
      return next.handle();
    }

    if (acquired !== "OK") {
      const existingRaw = await this.redis.get(storeKey);
      const existing = existingRaw ? (JSON.parse(existingRaw) as IdempotencyRecord) : null;

      if (existing && existing.bodyHash !== bodyHash) {
        throw new ValidationError("Idempotency-Key was already used with a different request payload");
      }
      if (existing?.status === "completed") {
        context.switchToHttp().getResponse<Response>().setHeader("Idempotent-Replay", "true");
        return of(existing.response);
      }
      throw new ConflictError("A request with this Idempotency-Key is already being processed");
    }

    return next.handle().pipe(
      concatMap(async (response) => {
        const record: IdempotencyRecord = { status: "completed", bodyHash, httpStatus: 201, response };
        await this.redis.set(storeKey, JSON.stringify(record), "EX", RESULT_TTL_SECONDS).catch(() => undefined);
        return response;
      }),
      catchError((err) =>
        // Release the lock so a corrected retry can proceed immediately.
        from(this.redis.del(storeKey).catch(() => undefined)).pipe(concatMap(() => throwError(() => err)))
      )
    );
  }
}
