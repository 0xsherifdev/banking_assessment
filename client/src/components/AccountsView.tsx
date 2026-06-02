import type { Account } from "../types";
import { AccountCard } from "./AccountCard";
import { ErrorState } from "./ErrorState";

export function AccountsView({
  accounts,
  loading,
  error,
  onRetry,
  onSelect,
}: {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (id: number) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-slate-900">Your Accounts</h2>

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
          You don't have any accounts yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onViewTransactions={() => onSelect(account.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
