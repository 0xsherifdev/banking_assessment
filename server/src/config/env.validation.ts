import { plainToInstance, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength, validateSync } from "class-validator";

export enum NodeEnv {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT = 3001;

  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  REDIS_HOST = "localhost";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT = 6379;

  // Required once auth lands (Phase 3); optional here so the app boots earlier in the build-out.
  @IsOptional()
  @IsString()
  @MinLength(16)
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN = "1h";

  @IsOptional()
  @IsString()
  PAYSTACK_SECRET_KEY?: string;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }
  return validated;
}
