import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/current-user.decorator";
import { AccountsService } from "./accounts.service";
import { AccountResponseDto } from "./dto/account-response.dto";

@ApiTags("accounts")
@ApiBearerAuth()
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's accounts" })
  @ApiOkResponse({ type: [AccountResponseDto] })
  async list(@CurrentUser() user: AuthUser): Promise<AccountResponseDto[]> {
    const accounts = await this.accounts.listAccounts(user.id);
    return accounts.map((account) => AccountResponseDto.from(account));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one of the current user's accounts" })
  @ApiOkResponse({ type: AccountResponseDto })
  async get(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser
  ): Promise<AccountResponseDto> {
    return AccountResponseDto.from(await this.accounts.getOwnedAccount(id, user.id));
  }
}
