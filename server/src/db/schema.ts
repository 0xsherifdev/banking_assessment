import { integer, pgEnum, pgTable, varchar, timestamp, text, doublePrecision } from "drizzle-orm/pg-core";

export const accountType = pgEnum("account_type", ["CHECKING", "SAVINGS"]);
export const accountsTable = pgTable("accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  accountNumber: varchar({ length: 11 }).notNull(),
  accountType: accountType().notNull(),
  balance: doublePrecision('balance').notNull(),
  accountHolder: varchar(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const transactionType = pgEnum("transaction_type", ["DEPOSIT", "WITHDRAWAL", "TRANSFER"]);

// TODO: add transaction status (PENDING, PROCESSING, FULFILLED), reference, created_at, update_at
export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  type: transactionType(),
  amount: doublePrecision('balance').notNull(),
  description: text(),
  accountId: integer().references(() => accountsTable.id),
});
