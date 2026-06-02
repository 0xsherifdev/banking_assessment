import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Injection token for the Drizzle database instance. */
export const DRIZZLE = Symbol("DRIZZLE");

export type DrizzleDB = NodePgDatabase<typeof schema>;

export function createDrizzle(connectionString: string): { db: DrizzleDB; pool: Pool } {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema, casing: "snake_case" });
  return { db, pool };
}
