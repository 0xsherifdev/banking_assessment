import type { SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "block w-full rounded-control border-0 bg-surface px-3 py-2 text-sm text-ink-900 ring-1 ring-inset ring-ink-300 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}
