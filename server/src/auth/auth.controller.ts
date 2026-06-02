import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthUser } from "./auth-user";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { AuthResponseDto, UserProfileDto } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "./public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiCreatedResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  @Public()
  // Brute-force guard: 5 attempts per minute per IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in and receive a JWT" })
  @ApiOkResponse({ type: AuthResponseDto })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the current user's profile" })
  @ApiOkResponse({ type: UserProfileDto })
  me(@CurrentUser() user: AuthUser): Promise<UserProfileDto> {
    return this.auth.getProfile(user.id);
  }
}
