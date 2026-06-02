import type { Account, Transaction } from "../db/schema";
import { centsToDollars } from "./money";

export interface AccountDTO {
  id: number;
  accountNumber: string;
  accountType: "CHECKING" | "SAVINGS";
  balance: number;
  accountHolder: string;
  createdAt: string;
}

export interface TransactionDTO {
  id: number;
  accountId: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
  direction: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  relatedAccountId: number | null;
  reference: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export function serializeAccount(account: Account): AccountDTO {
  return {
    id: account.id,
    accountNumber: account.accountNumber,
    accountType: account.accountType,
    balance: centsToDollars(account.balance),
    accountHolder: account.accountHolder,
    createdAt: account.createdAt.toISOString(),
  };
}

export function serializeTransaction(tx: Transaction): TransactionDTO {
  return {
    id: tx.id,
    accountId: tx.accountId,
    type: tx.type,
    direction: tx.direction,
    amount: centsToDollars(tx.amount),
    description: tx.description,
    relatedAccountId: tx.relatedAccountId,
    reference: tx.reference,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
  };
}
