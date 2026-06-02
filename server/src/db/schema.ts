import { bigint, index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Money is stored as integer cents (bigint), never floating point.
 * Floats cannot represent decimal currency exactly (0.1 + 0.2 !== 0.3),
 * so all balances/amounts are exact integers and converted to dollars
 * only at the API boundary. See lib/money.ts.
 */

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const accountType = pgEnum("account_type", ["CHECKING", "SAVINGS"]);

export const accountsTable = pgTable("accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  accountNumber: varchar({ length: 11 }).notNull().unique(),
  accountType: accountType().notNull(),
  balance: bigint({ mode: "number" }).notNull(),
  accountHolder: varchar({ length: 255 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const transactionType = pgEnum("transaction_type", ["DEPOSIT", "WITHDRAWAL", "TRANSFER"]);

/** Effect of a ledger entry on the owning account's balance. */
export const transactionDirection = pgEnum("transaction_direction", ["CREDIT", "DEBIT"]);

/**
 * PENDING  — created, awaiting external settlement (deposit/withdrawal via gateway).
 * COMPLETED — funds have moved.
 * FAILED   — gateway declined / expired.
 */
export const transactionStatus = pgEnum("transaction_status", ["PENDING", "COMPLETED", "FAILED"]);

/**
 * Append-only ledger. Each row records the effect on a single account.
 * A TRANSFER produces two linked rows (a DEBIT on the source account and a
 * CREDIT on the destination) sharing the same `reference`, giving a correct
 * double-entry history that is meaningful from both accounts' perspectives.
 */
export const transactionsTable = pgTable(
  "transactions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    accountId: integer()
      .notNull()
      .references(() => accountsTable.id),
    type: transactionType().notNull(),
    direction: transactionDirection().notNull(),
    amount: bigint({ mode: "number" }).notNull(),
    description: text().notNull(),
    relatedAccountId: integer().references(() => accountsTable.id),
    // Internal trace id (uuid). For external (Paystack) flows this is the gateway reference.
    reference: varchar({ length: 64 }).notNull().unique(),
    status: transactionStatus().notNull().default("COMPLETED"),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("transactions_account_created_idx").on(table.accountId, table.createdAt),
    index("transactions_reference_idx").on(table.reference),
  ]
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Account = typeof accountsTable.$inferSelect;
export type NewAccount = typeof accountsTable.$inferInsert;
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
