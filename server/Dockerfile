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

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Run as the unprivileged user that the node image already ships.
USER node

EXPOSE 3001
ENTRYPOINT ["./entrypoint.sh"]
