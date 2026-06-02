import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Logo } from "./Logo";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Banking Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-card bg-surface p-6 shadow-card outline outline-1 outline-ink-200">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && (
            <div className="rounded-control bg-negative-soft px-3 py-2 text-sm text-negative" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-ink-500">
          Demo accounts: john@example.com · jane@example.com — password{" "}
          <span className="font-medium text-ink-700">Password123!</span>
        </p>
      </div>
    </div>
  );
}
