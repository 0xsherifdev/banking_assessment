import "dotenv/config";
import { pool } from ".";

// Dev helper: drop everything so migrations can re-apply from scratch.
async function reset() {
  await pool.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE;");
  console.log("Database reset (public + drizzle schemas dropped).");
}

reset()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
