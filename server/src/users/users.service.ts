import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE, type DrizzleDB } from "../db/drizzle";
import { usersTable, type NewUser, type User } from "../db/schema";

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.email, email));
    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async create(input: Pick<NewUser, "email" | "passwordHash" | "name">): Promise<User> {
    const [user] = await this.db.insert(usersTable).values(input).returning();
    return user;
  }
}
