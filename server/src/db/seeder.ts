import { db } from ".";
import { accountsTable } from "./schema";

function main() {
  const sampleAccounts: (typeof accountsTable.$inferInsert)[] = [
    {
      accountNumber: "1001",
      accountType: "CHECKING",
      balance: 5000.0,
      accountHolder: "John Doe",
    },
    {
      accountNumber: "1002",
      accountType: "SAVINGS",
      balance: 10000.0,
      accountHolder: "Jane Smith",
    },
  ];

  db.insert(accountsTable)
    .values(sampleAccounts)
    .then(() => console.log("Database seed successful!"))
    .catch((err) => console.log(err));
}

main();
