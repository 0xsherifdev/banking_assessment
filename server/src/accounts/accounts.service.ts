import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { accountsTable, type Account } from "../db/schema";
import { NotFoundError } from "../lib/errors";

@Injectable()
export class AccountsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async listAccounts(userId: number): Promise<Account[]> {
    return this.db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .orderBy(asc(accountsTable.id));
  }

  /**
   * Fetch an account the user owns. Scoping the query by userId (rather than
   * fetching then checking) means a non-owned account is indistinguishable from
   * a missing one — no account-id enumeration.
   */
  async getOwnedAccount(id: number, userId: number): Promise<Account> {
    const [account] = await this.db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, userId)));
    if (!account) {
      throw new NotFoundError(`Account ${id} not found`);
    }
    return account;
  }
}
