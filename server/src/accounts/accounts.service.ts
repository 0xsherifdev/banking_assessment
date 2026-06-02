import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { accountsTable, type Account } from "../db/schema";
import { NotFoundError } from "../lib/errors";
import { CacheService } from "../redis/cache.service";

const ACCOUNTS_TTL_SECONDS = 30;
const accountsListKey = (userId: number) => `accounts:list:${userId}`;

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly cache: CacheService
  ) {}

  async listAccounts(userId: number): Promise<Account[]> {
    const key = accountsListKey(userId);
    const cached = await this.cache.getJson<Account[]>(key);
    if (cached) {
      return cached.map((account) => ({ ...account, createdAt: new Date(account.createdAt) }));
    }
    const accounts = await this.db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .orderBy(asc(accountsTable.id));
    await this.cache.setJson(key, accounts, ACCOUNTS_TTL_SECONDS);
    return accounts;
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

  /** Invalidate cached account lists for the given owners (called after writes). */
  async invalidateAccountLists(userIds: number[]): Promise<void> {
    await this.cache.del(...userIds.map(accountsListKey));
  }
}
