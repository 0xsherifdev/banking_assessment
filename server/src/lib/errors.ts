/**
 * Operational error hierarchy. Anything thrown that is an AppError is treated
 * as an expected, client-facing failure and mapped to its HTTP status by the
 * central error handler; everything else becomes a 500.
 */

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  readonly isOperational = true;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
}

export class InsufficientFundsError extends AppError {
  readonly statusCode = 422;
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
}
