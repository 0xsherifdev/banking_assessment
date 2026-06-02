import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-[0.04em] text-ink-500"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-negative">{error}</p>}
    </div>
  );
}
