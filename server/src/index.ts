/**
 * Banking Dashboard API Server
 *
 * TECHNICAL ASSESSMENT NOTES:
 * This is a basic implementation with intentional areas for improvement:
 * - Currently uses in-memory SQLite (not persistent)
 * - Basic error handling
 * - No authentication/authorization
 * - No input validation
 * - No rate limiting
 * - No caching
 * - No logging system
 * - No tests
 *
 * Candidates should consider:
 * - Data persistence
 * - Security measures
 * - API documentation
 * - Error handling
 * - Performance optimization
 * - Code organization
 * - Testing strategy
 */

import express from "express";
import cors from "cors";
import { db } from "./db";
import { accountsTable, transactionsTable } from "./db/schema";
import { eq } from "drizzle-orm";

const app = express();
const PORT = 3001;

// Basic middleware setup - Consider additional security middleware
app.use(cors());
app.use(express.json());

// Basic API routes
// Consider: Input validation, authentication, rate limiting, response formatting
app.get("/api/accounts", (req, res) => {
  db.select()
    .from(accountsTable)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ error: err.message || "An error occurred" }));
});

app.get("/api/accounts/:id", (req, res) => {
  const accountId = parseInt(req.params.id);

  db.select()
    .from(accountsTable)
    .where(eq(accountsTable.id, accountId))
    .then((data) => res.json(data[0]))
    .catch((err) => res.status(500).json({ error: err.message || "An error occurred" }));
});

app.post("/api/accounts/:id/transactions", async (req, res) => {
  const accountId = parseInt(req.params.id);

  const { type, amount, description } = req.body;

  // TODO: add idempotency key to payload and save it as reference on transaction table
  if (!type || !amount || !description) {
    res.status(403).json({ error: "request body must contain type, amount and description" });
  }

  const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, accountId));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  try {
    switch (type) {
      case "DEPOSIT":
        db.transaction(async (tx) => {
          const [transaction] = await tx
            .insert(transactionsTable)
            .values({
              amount,
              type,
              description,
              accountId: account.id,
            })
            .returning();

          const updatedAccount = await tx
            .update(accountsTable)
            .set({
              balance: account.balance + transaction.amount,
            })
            .where(eq(accountsTable.id, account.id));

          res.json({ message: `Account has been credited with ${amount},New balance: ${updatedAccount}` });
        });
        break;
      case "WITHDRAWAL":
        res.status(500).json({ res: "Not implemented" });
        break;
      case "TRANSFER":
        res.status(500).json({ res: "Not implemented" });
        break;
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occured" });
  }
});

// Server startup
// Consider: Graceful shutdown, environment configuration, clustering
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
