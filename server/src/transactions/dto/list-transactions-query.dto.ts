import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import {
  SORT_FIELDS,
  SORT_ORDERS,
  type SortField,
  type SortOrder,
  TRANSACTION_TYPES,
  type TransactionType,
} from "../transaction.constants";

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional({ enum: TRANSACTION_TYPES, description: "Filter by transaction type" })
  @IsOptional()
  @IsIn(TRANSACTION_TYPES)
  type?: TransactionType;

  @ApiPropertyOptional({ enum: SORT_FIELDS, default: "createdAt" })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy: SortField = "createdAt";

  @ApiPropertyOptional({ enum: SORT_ORDERS, default: "desc" })
  @IsOptional()
  @IsIn(SORT_ORDERS)
  order: SortOrder = "desc";
}
