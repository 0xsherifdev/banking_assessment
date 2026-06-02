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
        <Spinner className="h-8 w-8 text-indigo-600" />
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
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        ← Back to accounts
      </button>

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              {account.accountHolder} · {account.accountType} · •••• {account.accountNumber}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {formatCurrency(account.balance)}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ New Transaction</Button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Transactions</h3>
          <div className="flex items-center gap-2">
            <label htmlFor="typeFilter" className="text-sm text-slate-500">
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
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            {typeFilter === "ALL" ? "No transactions yet." : `No ${typeFilter.toLowerCase()} transactions.`}
          </p>
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
