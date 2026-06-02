import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AccountsService } from "./accounts.service";
import { AccountResponseDto } from "./dto/account-response.dto";

@ApiTags("accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List all accounts" })
  @ApiOkResponse({ type: [AccountResponseDto] })
  async list(): Promise<AccountResponseDto[]> {
    const accounts = await this.accounts.listAccounts();
    return accounts.map((account) => AccountResponseDto.from(account));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an account by id" })
  @ApiOkResponse({ type: AccountResponseDto })
  async get(@Param("id", ParseIntPipe) id: number): Promise<AccountResponseDto> {
    return AccountResponseDto.from(await this.accounts.getAccountById(id));
  }
}
