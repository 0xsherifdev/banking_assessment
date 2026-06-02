import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccountResponseDto } from "../accounts/dto/account-response.dto";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import {
  PaginatedTransactionsDto,
  TransactionResponseDto,
  TransactionResultDto,
} from "./dto/transaction-response.dto";
import { TransactionsService } from "./transactions.service";

@ApiTags("transactions")
@Controller("accounts/:accountId/transactions")
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a deposit, withdrawal or transfer" })
  @ApiCreatedResponse({ type: TransactionResultDto })
  async create(
    @Param("accountId", ParseIntPipe) accountId: number,
    @Body() dto: CreateTransactionDto
  ): Promise<TransactionResultDto> {
    const result = await this.transactions.createTransaction(accountId, dto);
    return {
      transaction: TransactionResponseDto.from(result.transaction),
      account: AccountResponseDto.from(result.account),
      ...(result.relatedAccount && { relatedAccount: AccountResponseDto.from(result.relatedAccount) }),
    };
  }

  @Get()
  @ApiOperation({ summary: "List an account's transactions (paginated, filterable, sortable)" })
  @ApiOkResponse({ type: PaginatedTransactionsDto })
  async list(
    @Param("accountId", ParseIntPipe) accountId: number,
    @Query() query: ListTransactionsQueryDto
  ): Promise<PaginatedTransactionsDto> {
    const result = await this.transactions.listTransactions(accountId, query);
    return {
      data: result.data.map((tx) => TransactionResponseDto.from(tx)),
      pagination: result.pagination,
    };
  }
}
