import { Inject, Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { accountsTable, type Account } from "../db/schema";
import { NotFoundError } from "../lib/errors";

@Injectable()
export class AccountsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async listAccounts(): Promise<Account[]> {
    return this.db.select().from(accountsTable).orderBy(asc(accountsTable.id));
  }

  async getAccountById(id: number): Promise<Account> {
    const [account] = await this.db.select().from(accountsTable).where(eq(accountsTable.id, id));
    if (!account) {
      throw new NotFoundError(`Account ${id} not found`);
    }
    return account;
  }
}
