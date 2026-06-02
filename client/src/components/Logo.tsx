import { cn } from "../lib/utils";

/** Brand mark: an accent tile with a minimal three-bar ledger glyph. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-control bg-accent-600", className)}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-1/2 w-1/2">
        <path d="M3 11.5V7M8 11.5V4.5M13 11.5V9" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
  );
}
