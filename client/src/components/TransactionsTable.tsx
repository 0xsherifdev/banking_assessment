import type { SortField, SortOrder, Transaction, TransactionStatus, TransactionType } from "../types";
import { cn, formatCurrency, formatDate } from "../lib/utils";
import { Badge } from "./ui/Badge";

const typeBadge: Record<TransactionType, string> = {
  DEPOSIT: "bg-emerald-50 text-emerald-700",
  WITHDRAWAL: "bg-rose-50 text-rose-700",
  TRANSFER: "bg-indigo-50 text-indigo-700",
};

const statusBadge: Record<TransactionStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-rose-50 text-rose-700",
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
        className={cn("inline-flex items-center gap-1 hover:text-slate-900", align === "right" && "flex-row-reverse")}
      >
        {label}
        <span className={cn("text-xs", active ? "text-slate-900" : "text-slate-300")}>
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
        <thead className="border-b border-slate-200 text-left text-slate-500">
          <tr>
            <SortHeader label="Date" field="createdAt" sortBy={sortBy} order={order} onSort={onSort} />
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <SortHeader label="Amount" field="amount" sortBy={sortBy} order={order} onSort={onSort} align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(tx.createdAt)}</td>
              <td className="px-4 py-3">
                <Badge className={typeBadge[tx.type]}>{tx.type}</Badge>
                {tx.status !== "COMPLETED" && (
                  <Badge className={cn("ml-1", statusBadge[tx.status])}>{tx.status}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-700">{tx.description}</td>
              <td
                className={cn(
                  "whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums",
                  tx.direction === "CREDIT" ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {tx.direction === "CREDIT" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
