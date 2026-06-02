import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { type User } from "../db/schema";
import { ConflictError, NotFoundError, UnauthorizedError } from "../lib/errors";
import type { JwtPayload } from "./auth-user";
import { AuthResponseDto, UserProfileDto } from "./dto/auth-response.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import { UsersService } from "../users/users.service";

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictError("Email is already registered");
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({ email: dto.email, passwordHash, name: dto.name });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    // Compare against a hash even when the user is missing to avoid leaking
    // account existence via response timing.
    const ok = user
      ? await bcrypt.compare(dto.password, user.passwordHash)
      : await bcrypt.compare(dto.password, "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    if (!user || !ok) {
      throw new UnauthorizedError("Invalid email or password");
    }
    return this.buildAuthResponse(user);
  }

  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return UserProfileDto.from(user);
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { accessToken: this.jwt.sign(payload), user: UserProfileDto.from(user) };
  }
}
