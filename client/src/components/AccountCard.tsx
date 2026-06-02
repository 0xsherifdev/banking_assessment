import type { Account } from "../types";
import { formatCurrency } from "../lib/utils";
import { Button } from "./ui/Button";

export function AccountCard({
  account,
  onViewTransactions,
}: {
  account: Account;
  onViewTransactions: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-card bg-surface p-6 shadow-card outline outline-1 outline-ink-200 transition-[outline-color] hover:outline-ink-300">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-[0.05em] text-ink-500">{account.accountType}</span>
          <span className="money text-sm text-ink-400">•••• {account.accountNumber.slice(-4)}</span>
        </div>
        <p className="mt-5 text-sm text-ink-500">{account.accountHolder}</p>
        <p className="money mt-1 text-3xl font-semibold tracking-tight text-ink-900">
          {formatCurrency(account.balance)}
        </p>
      </div>
      <Button variant="secondary" className="mt-6 w-full" onClick={onViewTransactions}>
        View transactions
      </Button>
    </div>
  );
}
