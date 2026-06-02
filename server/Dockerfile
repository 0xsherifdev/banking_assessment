# syntax=docker/dockerfile:1

# ---- builder: install all deps, compile TS, prune to prod deps ----
# Full image (has build tools) so native modules like bcrypt compile cleanly.
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
# Drop devDependencies (incl. drizzle-kit/nest CLI); keep prod node_modules,
# with bcrypt's native binding already built for this Debian base.
RUN npm prune --omit=dev

# ---- runtime: slim image with only compiled output + prod deps ----
# Same Debian release (bookworm) as the builder, so the bcrypt binary matches.
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# curl is needed for container healthchecks: the slim image ships with neither
# curl nor wget, so any platform probe (and the HEALTHCHECK below) would fail.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Run as the unprivileged user that the node image already ships.
USER node

EXPOSE 3001
# Probe the readiness endpoint (verifies DB connectivity). start-period gives
# migrate-on-start time before failures count against the container.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT:-3001}/api/health" || exit 1
ENTRYPOINT ["./entrypoint.sh"]
