import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { PaginatedTransactions, SortField, SortOrder, TransactionType } from "../types";

export function useTransactions(
  accountId: number,
  page: number,
  limit: number,
  type: TransactionType | undefined,
  sortBy: SortField,
  order: SortOrder
) {
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.getTransactions(accountId, { page, limit, type, sortBy, order }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [accountId, page, limit, type, sortBy, order]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
