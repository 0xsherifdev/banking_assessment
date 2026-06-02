import { AccountList } from "./components/AccountList";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Banking Dashboard</h1>
      </header>
      <main className="flex pt-100 container mx-auto">
        <AccountList />
      </main>
    </div>
  );
}

export default App;
