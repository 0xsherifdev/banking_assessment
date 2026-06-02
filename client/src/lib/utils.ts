import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TransactionDirection } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Signed money for ledger rows: leading + / − (true minus, U+2212) on the absolute value. */
export function formatSignedCurrency(amount: number, direction: TransactionDirection): string {
  const sign = direction === "CREDIT" ? "+" : "−";
  return `${sign}${currencyFormatter.format(Math.abs(amount))}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
