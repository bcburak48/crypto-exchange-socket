import { NextFunction, Request, Response } from 'express';
import { addOrder, cancelOrder, getOrderBook } from '../services/orderService';

/**
 * Creates a new order (via Express).
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const { pair, side, price, quantity } = req.body;
  // The user ID can be taken from the decoded JWT.
  const user = (req as any).user;
  const userId = user?.sub || 'anonymous';

  const result = await addOrder(pair, side, Number(price), Number(quantity), userId);
  res.json(result);
}

/**
 * Cancels an order by ID.
 */
export async function deleteOrder(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  await cancelOrder(orderId);
  res.json({ message: `Order ${orderId} cancelled` });
}

/**
 * Retrieves an order book (top N bids and asks) for a given pair.
 */
export async function readOrderBook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { base, quote } = req.params;
    const { depth } = req.query;
    const pair = `${base}/${quote}`;

    const result = await getOrderBook(pair, depth ? Number(depth) : 5);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
