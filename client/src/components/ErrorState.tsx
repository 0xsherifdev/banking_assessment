import { Button } from "./ui/Button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-card border border-negative/20 bg-negative-soft p-6 text-center" role="alert">
      <p className="text-sm font-medium text-negative">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
