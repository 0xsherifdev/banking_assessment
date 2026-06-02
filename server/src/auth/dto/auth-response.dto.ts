import { ApiProperty } from "@nestjs/swagger";
import type { User } from "../../db/schema";

export class UserProfileDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: "john@example.com" })
  email!: string;

  @ApiProperty({ example: "John Doe" })
  name!: string;

  static from(user: User): UserProfileDto {
    return Object.assign(new UserProfileDto(), { id: user.id, email: user.email, name: user.name });
  }
}

export class AuthResponseDto {
  @ApiProperty({ description: "JWT bearer token" })
  accessToken!: string;

  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;
}
