/**
 * Application Error Hierarchy
 * Provides granular, typed error classes with HTTP status codes and machine-readable error codes.
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Requested resource was not found", details?: unknown) {
    super(message, "NOT_FOUND", 404, details);
  }
}

export class DatabaseError extends AppError {
  public readonly originalError?: unknown;

  constructor(
    message: string = "Database operation failed",
    originalError?: unknown
  ) {
    super(
      message,
      "DATABASE_ERROR",
      500,
      originalError instanceof Error ? originalError.message : originalError
    );
    this.originalError = originalError;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Input validation failed", details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required", details?: unknown) {
    super(message, "UNAUTHORIZED", 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action", details?: unknown) {
    super(message, "FORBIDDEN", 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict detected", details?: unknown) {
    super(message, "CONFLICT", 409, details);
  }
}
