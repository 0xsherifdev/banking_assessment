export const TRANSACTION_TYPES = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const SORT_FIELDS = ["createdAt", "amount"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

/** Largest single transaction we accept, in dollars (guards against overflow / fat-finger input). */
export const MAX_AMOUNT_DOLLARS = 1_000_000;
