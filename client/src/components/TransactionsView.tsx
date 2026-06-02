import { useState } from "react";
import type { Account, SortField, TransactionType } from "../types";
import { useTransactions } from "../hooks/useTransactions";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Spinner } from "./ui/Spinner";
import { ErrorState } from "./ErrorState";
import { Pagination } from "./Pagination";
import { TransactionForm } from "./TransactionForm";
import { TransactionsTable } from "./TransactionsTable";

const LIMIT = 10;
const TYPE_FILTERS = ["ALL", "DEPOSIT", "WITHDRAWAL", "TRANSFER"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

export function TransactionsView({
  account,
  onBack,
  onTransacted,
}: {
  account: Account | null;
  onBack: () => void;
  onTransacted: () => void;
}) {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);

  const { data, loading, error, refetch } = useTransactions(
    account?.id ?? 0,
    page,
    LIMIT,
    typeFilter === "ALL" ? undefined : (typeFilter as TransactionType),
    sortBy,
    order
  );

  if (!account) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-accent-600" />
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };

  const handleTypeFilter = (value: TypeFilter) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleCreated = () => {
    setShowForm(false);
    onTransacted();
    if (page === 1) {
      void refetch();
    } else {
      setPage(1);
    }
  };

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 rounded-control text-sm text-ink-500 transition-colors hover:text-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
      >
        ← Back to accounts
      </button>

      <div className="mb-8 rounded-card bg-surface p-6 shadow-card outline outline-1 outline-ink-200">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-500">
              {account.accountHolder} · {account.accountType} ·{" "}
              <span className="money">•••• {account.accountNumber.slice(-4)}</span>
            </p>
            <p className="money mt-1 text-3xl font-semibold tracking-tight text-ink-900">
              {formatCurrency(account.balance)}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>New transaction</Button>
        </div>
      </div>

      <div className="rounded-card bg-surface shadow-card outline outline-1 outline-ink-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">Transactions</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="typeFilter" className="text-xs font-medium uppercase tracking-[0.04em] text-ink-500">
              Filter
            </label>
            <Select
              id="typeFilter"
              className="w-40"
              value={typeFilter}
              onChange={(e) => handleTypeFilter(e.target.value as TypeFilter)}
            >
              {TYPE_FILTERS.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All types" : t}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-control bg-ink-100" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-ink-900">
              {typeFilter === "ALL" ? "No transactions yet" : `No ${typeFilter.toLowerCase()} transactions`}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-ink-500">
              {typeFilter === "ALL"
                ? "When you move money in or out of this account, it'll show up here."
                : "Try a different filter to see more activity."}
            </p>
            {typeFilter === "ALL" && (
              <Button className="mt-5" onClick={() => setShowForm(true)}>
                New transaction
              </Button>
            )}
          </div>
        ) : (
          <>
            <TransactionsTable transactions={data.data} sortBy={sortBy} order={order} onSort={handleSort} />
            <Pagination meta={data.pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {showForm && (
        <TransactionForm account={account} onClose={() => setShowForm(false)} onCreated={handleCreated} />
      )}
    </section>
  );
}
