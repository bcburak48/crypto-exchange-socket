import { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/customErrors';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(`[${err.name}] ${err.message}`);

  if (err instanceof CustomError) {
    // Send a response and then simply return (no 'return res.status(...)')
    res.status(err.statusCode).json({
      error: {
        name: err.name,
        message: err.message
      }
    });
    return; // <= return void
  }

  // Send 500 and return void
  res.status(500).json({
    error: {
      name: err.name || 'Error',
      message: err.message || 'Something went wrong'
    }
  });
  return;
};
