import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { db, pool } from ".";
import { dollarsToCents } from "../lib/money";
import { accountsTable, transactionsTable, usersTable, type NewTransaction } from "./schema";

/**
 * Resets and seeds the database with the assessment's sample data.
 * Balances are the accounts' authoritative current balances; the listed items
 * are recent history records and are not used to recompute the balance.
 */
async function seed() {
  // Re-runnable: wipe all tables and reset identity sequences.
  await db.execute(
    sql`TRUNCATE TABLE ${transactionsTable}, ${accountsTable}, ${usersTable} RESTART IDENTITY CASCADE`
  );

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const [john, jane] = await db
    .insert(usersTable)
    .values([
      { email: "john@example.com", passwordHash, name: "John Doe" },
      { email: "jane@example.com", passwordHash, name: "Jane Smith" },
    ])
    .returning();

  const [johnChecking, janeSavings] = await db
    .insert(accountsTable)
    .values([
      {
        userId: john.id,
        accountNumber: "1001",
        accountType: "CHECKING",
        balance: dollarsToCents(5000),
        accountHolder: "John Doe",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
      {
        userId: jane.id,
        accountNumber: "1002",
        accountType: "SAVINGS",
        balance: dollarsToCents(10000),
        accountHolder: "Jane Smith",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      },
    ])
    .returning();

  const history: NewTransaction[] = [
    // John Doe — checking
    {
      accountId: johnChecking.id,
      type: "DEPOSIT",
      direction: "CREDIT",
      amount: dollarsToCents(1000),
      description: "Received salary deposit",
      reference: randomUUID(),
      createdAt: new Date("2024-01-15T09:00:00Z"),
    },
    {
      accountId: johnChecking.id,
      type: "WITHDRAWAL",
      direction: "DEBIT",
      amount: dollarsToCents(50),
      description: "Withdrew $50 from ATM",
      reference: randomUUID(),
      createdAt: new Date("2024-01-16T14:30:00Z"),
    },
    {
      accountId: johnChecking.id,
      type: "TRANSFER",
      direction: "DEBIT",
      amount: dollarsToCents(200),
      description: "Transferred $200 to savings account",
      reference: randomUUID(),
      createdAt: new Date("2024-01-17T11:15:00Z"),
    },
    // Jane Smith — savings
    {
      accountId: janeSavings.id,
      type: "DEPOSIT",
      direction: "CREDIT",
      amount: dollarsToCents(2000),
      description: "Received investment return",
      reference: randomUUID(),
      createdAt: new Date("2024-01-15T10:00:00Z"),
    },
    {
      accountId: janeSavings.id,
      type: "WITHDRAWAL",
      direction: "DEBIT",
      amount: dollarsToCents(100),
      description: "Online purchase debit",
      reference: randomUUID(),
      createdAt: new Date("2024-01-16T18:45:00Z"),
    },
    {
      accountId: janeSavings.id,
      type: "DEPOSIT",
      direction: "CREDIT",
      amount: dollarsToCents(500),
      description: "Received refund",
      reference: randomUUID(),
      createdAt: new Date("2024-01-17T08:20:00Z"),
    },
  ];

  await db.insert(transactionsTable).values(history);

  console.log("Seeded 2 users, 2 accounts and 6 transactions.");
  console.log("Login: john@example.com / jane@example.com — password: Password123!");
}

seed()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
