import "dotenv/config";
import { sql } from "drizzle-orm";
import { db, pool } from ".";
import { usersTable } from "./schema";
import { seed } from "./seeder";

// Seeds the demo data only when the database is empty, so a restart or redeploy
// never wipes real data. Enabled via SEED_ON_START=true in entrypoint.sh.
async function run() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  if (count > 0) {
    console.log(`Seed skipped — database already has ${count} user(s).`);
    return;
  }
  await seed();
}

run()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed check failed:", err);
    process.exit(1);
  });
