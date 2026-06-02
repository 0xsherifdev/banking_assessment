import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            B
          </div>
          <span className="text-lg font-semibold text-slate-900">Banking Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="hidden text-sm text-slate-600 sm:block">{user.name}</span>}
          <Button variant="secondary" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
