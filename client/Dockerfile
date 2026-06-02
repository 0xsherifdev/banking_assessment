# syntax=docker/dockerfile:1

# ---- builder: compile the Vite app to static assets ----
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# The API base URL is inlined at BUILD time (Vite bakes VITE_* into the bundle).
# This static image has no API proxy — the browser calls the API directly — so
# set the full public API URL (and add that origin to the API's CORS_ORIGIN), e.g.
#   --build-arg VITE_API_URL=https://api.example.com/api   (Coolify: a build variable)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- runtime: nginx serving the static SPA (no API proxy) ----
FROM nginx:1.27-alpine AS runtime
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
