import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccountResponseDto } from "../accounts/dto/account-response.dto";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { IdempotencyInterceptor } from "../common/interceptors/idempotency.interceptor";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { ListTransactionsQueryDto } from "./dto/list-transactions-query.dto";
import {
  PaginatedTransactionsDto,
  TransactionResponseDto,
  TransactionResultDto,
} from "./dto/transaction-response.dto";
import { TransactionsService } from "./transactions.service";

@ApiTags("transactions")
@ApiBearerAuth()
@Controller("accounts/:accountId/transactions")
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: "Create a deposit, withdrawal or transfer" })
  @ApiHeader({ name: "Idempotency-Key", required: false, description: "Client UUID to make retries safe" })
  @ApiCreatedResponse({ type: TransactionResultDto })
  async create(
    @Param("accountId", ParseIntPipe) accountId: number,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransactionDto
  ): Promise<TransactionResultDto> {
    const result = await this.transactions.createTransaction(accountId, user.id, dto);
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
    @CurrentUser() user: AuthUser,
    @Query() query: ListTransactionsQueryDto
  ): Promise<PaginatedTransactionsDto> {
    const result = await this.transactions.listTransactions(accountId, user.id, query);
    return {
      data: result.data.map((tx) => TransactionResponseDto.from(tx)),
      pagination: result.pagination,
    };
  }
}
