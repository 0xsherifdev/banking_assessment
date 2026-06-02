import { ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Response } from "express";
import { AppError } from "../../lib/errors";

interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Single place that turns any thrown value into a consistent JSON error.
 * Domain errors (AppError) carry their own status, keeping the service layer
 * free of HTTP concerns; class-validator failures arrive as HttpExceptions with
 * a `message` array and are normalised to { error, details }.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppError) {
      this.send(res, exception.statusCode, {
        error: exception.message,
        ...(exception.details !== undefined && { details: exception.details }),
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "object" && body !== null) {
        const record = body as Record<string, unknown>;
        const message = record.message;
        if (Array.isArray(message)) {
          this.send(res, status, { error: "Validation failed", details: message });
          return;
        }
        this.send(res, status, {
          error: typeof message === "string" ? message : (record.error as string) ?? exception.message,
        });
        return;
      }
      this.send(res, status, { error: String(body) });
      return;
    }

    this.logger.error("Unhandled exception", exception instanceof Error ? exception.stack : String(exception));
    this.send(res, HttpStatus.INTERNAL_SERVER_ERROR, { error: "Internal server error" });
  }

  private send(res: Response, status: number, body: ErrorResponse): void {
    res.status(status).json(body);
  }
}
