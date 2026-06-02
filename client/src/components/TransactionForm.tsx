import { useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import type { Account, CreateTransactionInput, TransactionResult, TransactionType } from "../types";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";

const TYPES: TransactionType[] = ["DEPOSIT", "WITHDRAWAL", "TRANSFER"];

export function TransactionForm({
  account,
  onClose,
  onCreated,
}: {
  account: Account;
  onClose: () => void;
  onCreated: (result: TransactionResult) => void;
}) {
  const [type, setType] = useState<TransactionType>("DEPOSIT");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): CreateTransactionInput | null => {
    const next: Record<string, string> = {};
    const amt = Number(amount);

    if (!amount || Number.isNaN(amt) || amt <= 0) {
      next.amount = "Enter an amount greater than 0";
    } else if (Math.abs(amt * 100 - Math.round(amt * 100)) > 1e-6) {
      // Epsilon-tolerant (matches server money.ts): 19.99 * 100 isn't exactly 1999 in float.
      next.amount = "At most 2 decimal places";
    }
    if (!description.trim()) {
      next.description = "Description is required";
    } else if (description.trim().length > 255) {
      next.description = "Must be 255 characters or fewer";
    }

    let toId: number | undefined;
    if (type === "TRANSFER") {
      toId = Number(toAccountId);
      if (!toAccountId || !Number.isInteger(toId) || toId <= 0) {
        next.toAccountId = "Enter a destination account id";
      } else if (toId === account.id) {
        next.toAccountId = "Cannot transfer to the same account";
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      return null;
    }
    return {
      type,
      amount: amt,
      description: description.trim(),
      ...(type === "TRANSFER" ? { toAccountId: toId } : {}),
    };
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const input = validate();
    if (!input) {
      return;
    }
    setSubmitting(true);
    try {
      // Idempotency key makes a double-submit / retry safe.
      const result = await api.createTransaction(account.id, input, crypto.randomUUID());
      onCreated(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.details?.length ? `${err.message}: ${err.details.join(", ")}` : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 p-4 backdrop-blur-[2px] motion-safe:animate-[fadeIn_150ms_ease-out]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-modal bg-surface p-6 shadow-overlay motion-safe:animate-[dialogIn_180ms_var(--ease-out-quint)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="New transaction"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-ink-900">New transaction</h3>
          <button
            onClick={onClose}
            className="rounded-control p-1 text-ink-400 transition-colors hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field label="Type" htmlFor="type">
            <Select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setErrors({});
              }}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Amount (USD)" htmlFor="amount" error={errors.amount}>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          {type === "TRANSFER" && (
            <Field label="Destination account ID" htmlFor="toAccountId" error={errors.toAccountId}>
              <Input
                id="toAccountId"
                type="number"
                min="1"
                placeholder="e.g. 2"
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
              />
            </Field>
          )}

          <Field label="Description" htmlFor="description" error={errors.description}>
            <Input
              id="description"
              type="text"
              maxLength={255}
              placeholder="e.g. Rent, Invoice #1024"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          {formError && (
            <div className="rounded-control bg-negative-soft px-3 py-2 text-sm text-negative" role="alert">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
