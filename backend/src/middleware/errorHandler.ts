import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Sequelize validation errors
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.errors.map(err => err.message).join(', ');
  }

  // Sequelize unique constraint error
  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export { errorHandler };
