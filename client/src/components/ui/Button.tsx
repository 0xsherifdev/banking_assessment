import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent-600 text-white hover:bg-accent-700 focus-visible:outline-accent-600",
  secondary: "bg-surface text-ink-700 ring-1 ring-inset ring-ink-300 hover:bg-ink-50 focus-visible:outline-accent-600",
  ghost: "text-ink-600 hover:bg-ink-100 focus-visible:outline-accent-600",
  danger: "bg-negative text-white hover:opacity-90 focus-visible:outline-negative",
};

export function Button({ variant = "primary", loading = false, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
