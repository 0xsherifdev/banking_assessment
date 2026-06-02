# syntax=docker/dockerfile:1

# ---- builder: compile the Vite app to static assets ----
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# API calls target a same-origin /api; nginx (below) proxies it to the backend.
# Vite inlines VITE_* from the environment at build time.
ENV VITE_API_URL=/api
RUN npm run build

# ---- runtime: nginx serving the static build + an /api reverse proxy ----
FROM nginx:1.27-alpine AS runtime

# Backend that the /api/ location proxies to. Override at runtime, e.g.
# -e API_UPSTREAM=http://host.docker.internal:3001
ENV API_UPSTREAM=http://api:3001

COPY --from=builder /app/dist /usr/share/nginx/html
# The nginx image runs envsubst over /etc/nginx/templates/*.template on start,
# substituting ${API_UPSTREAM} before launching nginx.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
