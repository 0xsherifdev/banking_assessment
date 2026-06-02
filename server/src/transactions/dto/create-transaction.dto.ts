import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsPositive, Max, MaxLength, ValidateIf } from "class-validator";
import { MAX_AMOUNT_DOLLARS, TRANSACTION_TYPES, type TransactionType } from "../transaction.constants";

export class CreateTransactionDto {
  @ApiProperty({ enum: TRANSACTION_TYPES })
  @IsIn(TRANSACTION_TYPES)
  type!: TransactionType;

  @ApiProperty({ example: 100.5, minimum: 0.01, maximum: MAX_AMOUNT_DOLLARS, description: "Amount in dollars" })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "amount cannot have more than 2 decimal places" })
  @IsPositive({ message: "amount must be greater than 0" })
  @Max(MAX_AMOUNT_DOLLARS)
  amount!: number;

  @ApiProperty({ example: "Salary deposit", maxLength: 255 })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsNotEmpty({ message: "description must not be empty" })
  @MaxLength(255)
  description!: string;

  @ApiPropertyOptional({ example: 2, description: "Destination account id — required for TRANSFER" })
  @ValidateIf((dto: CreateTransactionDto) => dto.type === "TRANSFER")
  @IsInt({ message: "toAccountId is required for TRANSFER" })
  @IsPositive()
  toAccountId?: number;
}
