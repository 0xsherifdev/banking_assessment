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
      <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-500">Overview</p>
      <h2 className="mb-5 mt-1 text-xl font-semibold tracking-tight text-ink-900">Your accounts</h2>

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-card bg-surface outline outline-1 outline-ink-200" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-card bg-surface p-10 text-center outline outline-1 outline-ink-200">
          <p className="text-sm font-medium text-ink-900">No accounts yet</p>
          <p className="mt-1 text-sm text-ink-500">Accounts you open will appear here.</p>
        </div>
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
