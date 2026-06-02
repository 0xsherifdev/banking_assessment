import { randomUUID } from "crypto";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { AccountsService } from "../accounts/accounts.service";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { accountsTable, transactionsTable, type Account, type Transaction } from "../db/schema";
import { InsufficientFundsError, NotFoundError, ValidationError } from "../lib/errors";
import { dollarsToCents } from "../lib/money";
import type { CreateTransactionDto } from "./dto/create-transaction.dto";
import type { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";

type Tx = Parameters<Parameters<DrizzleDB["transaction"]>[0]>[0];

export interface TransactionResult {
  transaction: Transaction;
  account: Account;
  /** Updated counterparty account — present only for TRANSFER. */
  relatedAccount?: Account;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly accounts: AccountsService
  ) {}

  /**
   * Apply a transaction atomically and return the updated account state.
   * DEPOSIT credits, WITHDRAWAL debits (guarding overdraft), and TRANSFER moves
   * funds between two accounts as a single all-or-nothing unit recorded as two
   * linked ledger rows.
   */
  async createTransaction(accountId: number, dto: CreateTransactionDto): Promise<TransactionResult> {
    const amount = dollarsToCents(dto.amount);
    const reference = randomUUID();

    return this.db.transaction(async (tx) => {
      switch (dto.type) {
        case "DEPOSIT": {
          const account = await this.lockAccount(tx, accountId);
          const updated = await this.setBalance(tx, accountId, account.balance + amount);
          const [transaction] = await tx
            .insert(transactionsTable)
            .values({
              accountId,
              type: "DEPOSIT",
              direction: "CREDIT",
              amount,
              description: dto.description,
              reference,
            })
            .returning();
          return { transaction, account: updated };
        }

        case "WITHDRAWAL": {
          const account = await this.lockAccount(tx, accountId);
          if (account.balance < amount) {
            throw new InsufficientFundsError("Insufficient funds for this withdrawal");
          }
          const updated = await this.setBalance(tx, accountId, account.balance - amount);
          const [transaction] = await tx
            .insert(transactionsTable)
            .values({
              accountId,
              type: "WITHDRAWAL",
              direction: "DEBIT",
              amount,
              description: dto.description,
              reference,
            })
            .returning();
          return { transaction, account: updated };
        }

        case "TRANSFER": {
          const toAccountId = dto.toAccountId!;
          if (toAccountId === accountId) {
            throw new ValidationError("Cannot transfer to the same account");
          }

          // Lock both accounts in ascending id order to avoid deadlocks between
          // concurrent transfers running in opposite directions.
          const lockOrder = [accountId, toAccountId].sort((a, b) => a - b);
          const locked = new Map<number, Account>();
          for (const id of lockOrder) {
            locked.set(id, await this.lockAccount(tx, id));
          }
          const source = locked.get(accountId)!;
          const destination = locked.get(toAccountId)!;

          if (source.balance < amount) {
            throw new InsufficientFundsError("Insufficient funds for this transfer");
          }

          const updatedSource = await this.setBalance(tx, accountId, source.balance - amount);
          const updatedDestination = await this.setBalance(tx, toAccountId, destination.balance + amount);

          // Each leg gets its own unique reference; groupReference links the pair.
          const groupReference = reference;
          const [debit] = await tx
            .insert(transactionsTable)
            .values({
              accountId,
              type: "TRANSFER",
              direction: "DEBIT",
              amount,
              description: dto.description,
              relatedAccountId: toAccountId,
              reference: randomUUID(),
              groupReference,
            })
            .returning();

          await tx.insert(transactionsTable).values({
            accountId: toAccountId,
            type: "TRANSFER",
            direction: "CREDIT",
            amount,
            description: dto.description,
            relatedAccountId: accountId,
            reference: randomUUID(),
            groupReference,
          });

          return { transaction: debit, account: updatedSource, relatedAccount: updatedDestination };
        }
      }
    });
  }

  async listTransactions(accountId: number, query: ListTransactionsQueryDto): Promise<PaginatedTransactions> {
    // 404 for an unknown account rather than silently returning an empty page.
    await this.accounts.getAccountById(accountId);

    const { page, limit, type, sortBy, order } = query;
    const offset = (page - 1) * limit;

    const filters = [eq(transactionsTable.accountId, accountId)];
    if (type) {
      filters.push(eq(transactionsTable.type, type));
    }
    const where = and(...filters);

    const sortColumn = sortBy === "amount" ? transactionsTable.amount : transactionsTable.createdAt;
    const dir = order === "asc" ? asc : desc;

    const [rows, [{ value: total }]] = await Promise.all([
      this.db
        .select()
        .from(transactionsTable)
        .where(where)
        // id is the stable tie-breaker so equal sort keys (e.g. same timestamp) page deterministically.
        .orderBy(dir(sortColumn), desc(transactionsTable.id))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(transactionsTable).where(where),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  private async lockAccount(tx: Tx, id: number): Promise<Account> {
    const [account] = await tx.select().from(accountsTable).where(eq(accountsTable.id, id)).for("update");
    if (!account) {
      throw new NotFoundError(`Account ${id} not found`);
    }
    return account;
  }

  private async setBalance(tx: Tx, id: number, balance: number): Promise<Account> {
    const [updated] = await tx.update(accountsTable).set({ balance }).where(eq(accountsTable.id, id)).returning();
    return updated;
  }
}
