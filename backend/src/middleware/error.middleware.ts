import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    errors?: Record<string, string>;
    stack?: string;
  };
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  let error = err;

  // Convert non-AppError errors to AppError
  if (!(error instanceof AppError)) {
    const statusCode = 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  const appError = error as AppError;

  const response: ErrorResponse = {
    success: false,
    error: {
      message: appError.message,
      statusCode: appError.statusCode,
    },
  };

  // Add validation errors if present
  if (error instanceof ValidationError) {
    response.error.errors = error.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = appError.stack;
  }

  // Log error details
  if (!appError.isOperational) {
    console.error('💥 ERROR:', {
      message: appError.message,
      stack: appError.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(appError.statusCode).json(response);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
