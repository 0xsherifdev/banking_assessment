export type AccountType = "CHECKING" | "SAVINGS";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";
export type TransactionDirection = "CREDIT" | "DEBIT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: AccountType;
  balance: number;
  accountHolder: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  accountId: number;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  description: string;
  relatedAccountId: number | null;
  reference: string;
  groupReference: string | null;
  status: TransactionStatus;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedTransactions {
  data: Transaction[];
  pagination: PaginationMeta;
}

export interface TransactionResult {
  transaction: Transaction;
  account: Account;
  relatedAccount?: Account;
}

export type SortField = "createdAt" | "amount";
export type SortOrder = "asc" | "desc";

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  sortBy?: SortField;
  order?: SortOrder;
}

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  description: string;
  toAccountId?: number;
}
