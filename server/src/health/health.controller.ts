import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { sql } from "drizzle-orm";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { Public } from "../auth/public.decorator";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Liveness/readiness probe (verifies DB connectivity)" })
  async check(): Promise<{ status: string; db: string }> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: "ok", db: "up" };
    } catch {
      throw new ServiceUnavailableException({ status: "error", db: "down" });
    }
  }
}
