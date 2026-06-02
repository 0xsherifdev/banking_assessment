import { useState } from "react";
import { useAccounts } from "../hooks/useAccounts";
import { AccountsView } from "./AccountsView";
import { Header } from "./Header";
import { TransactionsView } from "./TransactionsView";

export function Dashboard() {
  const { accounts, loading, error, refetch } = useAccounts();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = accounts.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {selectedId !== null ? (
          <TransactionsView account={selected} onBack={() => setSelectedId(null)} onTransacted={refetch} />
        ) : (
          <AccountsView
            accounts={accounts}
            loading={loading}
            error={error}
            onRetry={refetch}
            onSelect={setSelectedId}
          />
        )}
      </main>
    </div>
  );
}
