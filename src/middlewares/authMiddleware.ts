import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError, AuthorizationError } from '../utils/customErrors';

/**
 * Express middleware for JWT-based authentication.
 */
export function expressAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new AuthenticationError('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AuthenticationError('Invalid token format');
  }

  try {
    // Verifies the token with the secret key and attaches the decoded payload
    (req as any).user = jwt.verify(token, config.jwtSecret) as Record<string, any>;
    next();
  } catch (err) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Role-based access check.
 */
export function checkRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      throw new AuthorizationError('Forbidden: insufficient role');
    }
    next();
  };
}
