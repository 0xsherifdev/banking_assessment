import "dotenv/config";
import { createDrizzle } from "./drizzle";

// Standalone connection for CLI scripts (seeder, migrations). The Nest app
// gets its own DI-managed instance via DrizzleModule.
export const { db, pool } = createDrizzle(process.env.DATABASE_URL!);
