import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from ".";

// Run on container start (see entrypoint.sh). Uses the drizzle-orm migrator so
// the production image needs no drizzle-kit (dev-only) — just the SQL in
// ./drizzle. Retries so a database that's still booting doesn't fail the deploy.
const RETRIES = Number(process.env.MIGRATE_RETRIES ?? 10);
const DELAY_MS = Number(process.env.MIGRATE_RETRY_DELAY_MS ?? 2000);

async function run() {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("Migrations applied.");
      return;
    } catch (err) {
      if (attempt === RETRIES) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Migration attempt ${attempt}/${RETRIES} failed (${msg}); retrying in ${DELAY_MS}ms...`);
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }
}

run()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
