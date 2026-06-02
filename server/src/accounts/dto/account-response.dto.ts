import { ApiProperty } from "@nestjs/swagger";
import type { Account } from "../../db/schema";
import { centsToDollars } from "../../lib/money";

export class AccountResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "1001" })
  accountNumber!: string;

  @ApiProperty({ enum: ["CHECKING", "SAVINGS"], example: "CHECKING" })
  accountType!: "CHECKING" | "SAVINGS";

  @ApiProperty({ example: 5000, description: "Current balance in dollars" })
  balance!: number;

  @ApiProperty({ example: "John Doe" })
  accountHolder!: string;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  createdAt!: string;

  static from(account: Account): AccountResponseDto {
    return Object.assign(new AccountResponseDto(), {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: centsToDollars(account.balance),
      accountHolder: account.accountHolder,
      createdAt: account.createdAt.toISOString(),
    });
  }
}
