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
    <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {account.accountType}
          </span>
          <span className="font-mono text-sm text-slate-400">•••• {account.accountNumber}</span>
        </div>
        <p className="mt-4 text-sm text-slate-500">{account.accountHolder}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(account.balance)}
        </p>
      </div>
      <Button variant="secondary" className="mt-5 w-full" onClick={onViewTransactions}>
        View Transactions
      </Button>
    </div>
  );
}
