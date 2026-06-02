# Banking Dashboard

A full-stack banking dashboard: create and view account transactions (deposits, withdrawals, transfers) with an authenticated React frontend over a NestJS + PostgreSQL API.

## Stack

**Backend** — NestJS · TypeScript · Drizzle ORM · PostgreSQL · Redis
**Frontend** — React · TypeScript · Vite · Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL + Redis)

### 1. Infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env        # set JWT_SECRET (any 16+ chars); defaults work for local Postgres/Redis
npm run db:migrate          # apply schema
npm run db:seed             # seed sample accounts + transactions
npm run dev                 # http://localhost:3001  (Swagger UI at /docs)
```

### 3. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Or run both from the repo root: `npm run install-all && npm run dev` (after infra + migrate + seed).

### Demo accounts

| Email             | Password       | Account            | Balance  |
| ----------------- | -------------- | ------------------ | -------- |
| john@example.com  | `Password123!` | 1001 (Checking)    | $5,000   |
| jane@example.com  | `Password123!` | 1002 (Savings)     | $10,000  |

## Docker deployment

Two images: `server/Dockerfile` (NestJS API) and `client/Dockerfile` (static SPA on nginx). The browser calls the API **directly**, so the client bakes in the API URL at build time and the API allows the client's origin via CORS.

### API

`entrypoint.sh` **runs migrations on startup** (Drizzle migrator — no manual `db:migrate`). Set `SEED_ON_START=true` to also load the demo data; seeding is **idempotent** (only an empty DB), so restarts never wipe data.

```bash
docker build -t banking-api ./server
docker run -p 3001:3001 \
  -e DATABASE_URL="postgres://user:pass@host:5432/bankdb" \
  -e JWT_SECRET="a-random-secret-at-least-16-chars" \
  -e REDIS_URL="redis://default:pass@host:6379/0" \
  -e CORS_ORIGIN="https://your-client-domain" \
  -e SEED_ON_START=true \
  banking-api
```

Required: `DATABASE_URL`, `JWT_SECRET` (entrypoint fails fast without them). Optional: `REDIS_URL` (managed Redis; otherwise `REDIS_HOST`/`REDIS_PORT`, default `localhost:6379`), `CORS_ORIGIN` (comma-separated origin allowlist — unset reflects any origin, so **set it in production**), `SEED_ON_START`. The migrator retries while the DB comes up.

### Client

The API base URL is inlined at build time, so pass it as a build arg (Coolify: a build variable). nginx serves the static build with SPA history-fallback — no runtime env or API proxy.

```bash
docker build -t banking-client \
  --build-arg VITE_API_URL="https://your-api-domain/api" ./client
docker run -p 8080:80 banking-client   # → http://localhost:8080
```

Make sure the API's `CORS_ORIGIN` includes the client's origin, and expose port `80` on the client.

## API

All routes are under `/api`. Everything except `register`, `login` and `health` requires a `Bearer` JWT. Full interactive docs at **`/docs`** (Swagger).

| Method | Endpoint                              | Notes                                              |
| ------ | ------------------------------------- | -------------------------------------------------- |
| POST   | `/auth/register`                      | `{ email, password, name }`                        |
| POST   | `/auth/login`                         | `{ email, password }` → `{ accessToken, user }`    |
| GET    | `/auth/me`                            | current user                                       |
| GET    | `/accounts`                           | the user's accounts                                |
| GET    | `/accounts/:id`                       | one owned account                                  |
| POST   | `/accounts/:id/transactions`          | `{ type, amount, description, toAccountId? }`      |
| GET    | `/accounts/:id/transactions`          | `?page&limit&type&sortBy=createdAt\|amount&order`  |
| GET    | `/health`                             | liveness + DB check                                |

`POST /accounts/:id/transactions` accepts an optional **`Idempotency-Key`** header so a retried request never applies twice.

## Architecture & Key Decisions

This started from a deliberately-basic scaffold; the notable changes:

1. **Money is stored as integer cents (bigint), never floats.** The provided scaffold stored balances as a floating-point `REAL`, and an early iteration of my own Postgres schema briefly used `numeric(7,4)` (a max of **$999.9999** — unable to even record a $1,000 deposit) before I settled on integer cents. Floats can't represent currency exactly; integer cents are exact, and dollars exist only at the API boundary.
2. **Atomic double-entry transfers.** A transfer locks both accounts `FOR UPDATE` (in ascending id order, so concurrent opposite transfers can't deadlock), checks funds, then writes a linked `DEBIT` + `CREDIT` sharing a `groupReference`. Withdrawals/transfers reject overdraft (422).
3. **Layered, framework-agnostic domain.** Services throw a small domain error hierarchy; a single exception filter maps those (and validation failures) to consistent JSON, so business logic stays free of HTTP concerns.
4. **Input validation** via class-validator DTOs (amount > 0 and ≤ 2 decimals, description required, `toAccountId` required only for transfers).
5. **Auth + ownership.** JWT login; users only see/act on their own accounts (a non-owned account 404s — no id enumeration).
6. **Idempotency keys** (Redis) on writes; **read-through caching** (Redis) on account/transaction lists, invalidated on every write.
7. **Rate limiting** (global + tighter on login), **helmet**, **Swagger**, request validation, graceful shutdown.
8. Server-side **pagination, type filtering and sort** (date/amount).

### Considered but intentionally out of scope

A real external payment gateway (Paystack) with **async settlement via BullMQ** — deposits/withdrawals would go `PENDING` → gateway → webhook → settle, with reliable webhook processing/reconciliation. The `transactions.status` lifecycle is already modeled for it, but it was cut to keep the submission focused on the assessment's scope (internal, synchronous transactions).

## Project Structure

```
server/src/
  accounts/        accounts module (controller, service, dto)
  transactions/    transactions module (atomic create + paginated list)
  auth/            JWT auth, guard, strategy
  users/           credential lookup/creation
  redis/           ioredis client + cache service
  common/          exception filter, idempotency interceptor
  db/              Drizzle schema, connection, migrations, seeder
client/src/
  components/      dashboard, account cards, transactions table, form
  context/         auth context
  hooks/           useAccounts, useTransactions
  lib/             api client, formatting
```
