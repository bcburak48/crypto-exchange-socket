import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Simple IP-based rate limiter.
 */
const userRequests = new Map<string, number[]>();

export const rateLimiter: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.ip || 'unknown';
  const currentTime = Date.now();
  const windowMs = 60_000; // 1 minute window
  const maxRequests = 10; // max 10 requests per minute

  const timestamps = userRequests.get(userId) || [];

  // Remove timestamps older than the time window
  while (timestamps.length && timestamps[0] <= currentTime - windowMs) {
    timestamps.shift();
  }

  if (timestamps.length >= maxRequests) {
    res.status(429).json({ message: 'Rate limit exceeded.' });
    // Return here to avoid any further Express logic
    return;
  }

  timestamps.push(currentTime);
  userRequests.set(userId, timestamps);

  next();
};
