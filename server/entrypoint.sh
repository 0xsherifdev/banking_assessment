#!/bin/sh
set -e

# Fail fast on missing required config rather than crashing later mid-request.
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"

echo "[entrypoint] Applying database migrations..."
node dist/db/migrate.js

# Opt-in demo seed. seed-if-empty.js only inserts when the DB has no users, so
# enabling this is safe across restarts (it won't wipe real data).
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "[entrypoint] Seeding demo data (only if database is empty)..."
  node dist/db/seed-if-empty.js
fi

echo "[entrypoint] Starting API..."
# exec so node becomes PID 1 and receives SIGTERM for graceful shutdown
# (Nest's enableShutdownHooks closes the DB pool / Redis cleanly).
exec node dist/main.js
