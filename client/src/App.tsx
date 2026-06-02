import { AuthProvider, useAuth } from "./context/AuthContext";
import { Dashboard } from "./components/Dashboard";
import { LoginPage } from "./components/LoginPage";
import { Spinner } from "./components/ui/Spinner";

function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner className="h-8 w-8 text-accent-600" />
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
