import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Logo } from "./Logo";

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-ink-200 bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight text-ink-900">Banking Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="hidden text-sm text-ink-600 sm:block">{user.name}</span>}
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
