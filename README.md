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

1. **Money is stored as integer cents (bigint), never floats.** The original schema stored transaction amounts as `numeric(7,4)` mislabeled `balance` — a max of **$999.9999**, unable to even record a $1,000 deposit. Dollars exist only at the API boundary.
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
