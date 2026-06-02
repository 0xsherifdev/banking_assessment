import { ApiProperty } from "@nestjs/swagger";
import type { Transaction } from "../../db/schema";
import { centsToDollars } from "../../lib/money";
import { AccountResponseDto } from "../../accounts/dto/account-response.dto";

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  accountId!: number;

  @ApiProperty({ enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"] })
  type!: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER";

  @ApiProperty({ enum: ["CREDIT", "DEBIT"], description: "Effect on this account's balance" })
  direction!: "CREDIT" | "DEBIT";

  @ApiProperty({ example: 100.5, description: "Amount in dollars" })
  amount!: number;

  @ApiProperty({ example: "Salary deposit" })
  description!: string;

  @ApiProperty({ nullable: true, example: null, description: "Counterparty account for transfers" })
  relatedAccountId!: number | null;

  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  reference!: string;

  @ApiProperty({ nullable: true, description: "Links the two legs of a transfer" })
  groupReference!: string | null;

  @ApiProperty({ enum: ["PENDING", "COMPLETED", "FAILED"] })
  status!: "PENDING" | "COMPLETED" | "FAILED";

  @ApiProperty({ example: "2024-01-15T09:00:00.000Z" })
  createdAt!: string;

  static from(tx: Transaction): TransactionResponseDto {
    return Object.assign(new TransactionResponseDto(), {
      id: tx.id,
      accountId: tx.accountId,
      type: tx.type,
      direction: tx.direction,
      amount: centsToDollars(tx.amount),
      description: tx.description,
      relatedAccountId: tx.relatedAccountId,
      reference: tx.reference,
      groupReference: tx.groupReference,
      status: tx.status,
      createdAt: tx.createdAt.toISOString(),
    });
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 3 })
  total!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;

  @ApiProperty({ example: false })
  hasNext!: boolean;

  @ApiProperty({ example: false })
  hasPrev!: boolean;
}

export class PaginatedTransactionsDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  data!: TransactionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class TransactionResultDto {
  @ApiProperty({ type: TransactionResponseDto })
  transaction!: TransactionResponseDto;

  @ApiProperty({ type: AccountResponseDto, description: "Updated source account" })
  account!: AccountResponseDto;

  @ApiProperty({ type: AccountResponseDto, required: false, description: "Updated destination account (transfers)" })
  relatedAccount?: AccountResponseDto;
}
