import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Account } from "../types";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Silent (re)fetch — does not toggle the initial loading skeleton.
  const refetch = useCallback(async () => {
    try {
      setAccounts(await api.getAccounts());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refetch();
      setLoading(false);
    })();
  }, [refetch]);

  return { accounts, loading, error, refetch };
}
