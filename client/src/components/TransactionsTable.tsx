import type { SortField, SortOrder, Transaction, TransactionStatus, TransactionType } from "../types";
import { cn, formatDate, formatSignedCurrency } from "../lib/utils";
import { Badge } from "./ui/Badge";

// Neutral type badges — the signed, coloured amount already carries direction.
const typeBadge: Record<TransactionType, string> = {
  DEPOSIT: "bg-positive-soft text-positive",
  WITHDRAWAL: "bg-ink-100 text-ink-600",
  TRANSFER: "bg-ink-100 text-ink-600",
};

// Status colour carries meaning: red is reserved strictly for FAILED.
const statusBadge: Record<TransactionStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  COMPLETED: "bg-positive-soft text-positive",
  FAILED: "bg-negative-soft text-negative",
};

function SortHeader({
  label,
  field,
  sortBy,
  order,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  sortBy: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const active = sortBy === field;
  return (
    <th className={cn("px-4 py-3 font-medium", align === "right" && "text-right")}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 rounded-control transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        <span className={cn("text-xs", active ? "text-ink-900" : "text-ink-300")}>
          {active ? (order === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function TransactionsTable({
  transactions,
  sortBy,
  order,
  onSort,
}: {
  transactions: Transaction[];
  sortBy: SortField;
  order: SortOrder;
  onSort: (field: SortField) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-ink-200 bg-surface text-left text-ink-500">
          <tr>
            <SortHeader label="Date" field="createdAt" sortBy={sortBy} order={order} onSort={onSort} />
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <SortHeader label="Amount" field="amount" sortBy={sortBy} order={order} onSort={onSort} align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="transition-colors hover:bg-ink-50">
              <td className="whitespace-nowrap px-4 py-3.5 text-ink-600">{formatDate(tx.createdAt)}</td>
              <td className="px-4 py-3.5">
                <Badge className={typeBadge[tx.type]}>{tx.type}</Badge>
                {tx.status !== "COMPLETED" && (
                  <Badge className={cn("ml-1.5", statusBadge[tx.status])}>{tx.status}</Badge>
                )}
              </td>
              <td className="max-w-xs truncate px-4 py-3.5 text-ink-700">{tx.description}</td>
              <td
                className={cn(
                  "money whitespace-nowrap px-4 py-3.5 text-right font-medium",
                  tx.direction === "CREDIT" ? "text-positive" : "text-ink-900"
                )}
              >
                {formatSignedCurrency(tx.amount, tx.direction)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
