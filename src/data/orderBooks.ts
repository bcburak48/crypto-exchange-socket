// In-memory fallback data for testing or development environments.
import { Order } from '../interfaces/order';

export const orderBooks: Record<
  string,
  {
    bids: { id: string; price: number; quantity: number }[];
    asks: { id: string; price: number; quantity: number }[];
    trades: { tradeId: string; price: number; quantity: number; timestamp: number }[];
  }
> = {
  'BTC/USDT': {
    bids: [
      { id: 'bid1', price: 27000, quantity: 0.5 },
      { id: 'bid2', price: 26950, quantity: 1.2 },
      { id: 'bid3', price: 26900, quantity: 0.8 },
      { id: 'bid4', price: 26880, quantity: 2.0 },
      { id: 'bid5', price: 26800, quantity: 0.3 },
      { id: 'bid6', price: 26750, quantity: 1.5 },
      { id: 'bid7', price: 26700, quantity: 3.1 }
    ],
    asks: [
      { id: 'ask1', price: 27100, quantity: 0.3 },
      { id: 'ask2', price: 27200, quantity: 0.8 },
      { id: 'ask3', price: 27350, quantity: 0.4 },
      { id: 'ask4', price: 27400, quantity: 1.0 },
      { id: 'ask5', price: 27500, quantity: 2.0 },
      { id: 'ask6', price: 27600, quantity: 1.2 },
      { id: 'ask7', price: 27800, quantity: 0.7 }
    ],
    trades: [
      { tradeId: 't1', price: 26980, quantity: 0.2, timestamp: 1690000000000 },
      { tradeId: 't2', price: 27010, quantity: 0.5, timestamp: 1690000200000 },
      { tradeId: 't3', price: 26990, quantity: 1.0, timestamp: 1690001000000 }
    ]
  },
  'ETH/USDT': {
    bids: [
      { id: 'bid1', price: 1900, quantity: 2.5 },
      { id: 'bid2', price: 1895, quantity: 1.0 },
      { id: 'bid3', price: 1890, quantity: 0.7 },
      { id: 'bid4', price: 1885, quantity: 3.0 }
    ],
    asks: [
      { id: 'ask1', price: 1910, quantity: 1.2 },
      { id: 'ask2', price: 1920, quantity: 0.5 },
      { id: 'ask3', price: 1930, quantity: 2.1 },
      { id: 'ask4', price: 1950, quantity: 1.8 }
    ],
    trades: [
      { tradeId: 't1', price: 1898, quantity: 2.0, timestamp: 1690002000000 },
      { tradeId: 't2', price: 1901, quantity: 0.3, timestamp: 1690002100000 }
    ]
  },
  'XRP/USDT': {
    bids: [
      { id: 'bid1', price: 0.5, quantity: 500 },
      { id: 'bid2', price: 0.495, quantity: 1200 },
      { id: 'bid3', price: 0.49, quantity: 1000 }
    ],
    asks: [
      { id: 'ask1', price: 0.505, quantity: 300 },
      { id: 'ask2', price: 0.51, quantity: 800 },
      { id: 'ask3', price: 0.52, quantity: 600 }
    ],
    trades: [
      { tradeId: 't1', price: 0.501, quantity: 700, timestamp: 1690003000000 },
      { tradeId: 't2', price: 0.499, quantity: 400, timestamp: 1690003100000 }
    ]
  },
  'LTC/USDT': {
    bids: [
      { id: 'bid1', price: 90.5, quantity: 5 },
      { id: 'bid2', price: 90.0, quantity: 2.5 },
      { id: 'bid3', price: 89.5, quantity: 3 }
    ],
    asks: [
      { id: 'ask1', price: 91.0, quantity: 2 },
      { id: 'ask2', price: 92.0, quantity: 4 },
      { id: 'ask3', price: 93.5, quantity: 1.2 }
    ],
    trades: [{ tradeId: 't1', price: 90.25, quantity: 1.5, timestamp: 1690004000000 }]
  },
  'ADA/USDT': {
    bids: [
      { id: 'bid1', price: 0.3, quantity: 5000 },
      { id: 'bid2', price: 0.295, quantity: 3000 },
      { id: 'bid3', price: 0.29, quantity: 6000 }
    ],
    asks: [
      { id: 'ask1', price: 0.305, quantity: 2000 },
      { id: 'ask2', price: 0.31, quantity: 4000 },
      { id: 'ask3', price: 0.32, quantity: 3000 }
    ],
    trades: [{ tradeId: 't1', price: 0.299, quantity: 1500, timestamp: 1690005000000 }]
  }
};

/**
 * Adds a new order in in-memory data.
 */
export function addOrderInMemory(
  pair: string,
  side: 'buy' | 'sell',
  price: number,
  quantity: number,
  userId?: string
): Order {
  const orderId = `mem-${Date.now()}`;
  const timestamp = Date.now();
  const newOrder: Order = {
    orderId,
    pair,
    side,
    price,
    quantity,
    timestamp,
    userId
  };

  if (!orderBooks[pair]) {
    orderBooks[pair] = { bids: [], asks: [], trades: [] };
  }
  if (side === 'buy') {
    orderBooks[pair].bids.push({ id: orderId, price, quantity });
    // Sort bids descending by price
    orderBooks[pair].bids.sort((a, b) => b.price - a.price);
  } else {
    orderBooks[pair].asks.push({ id: orderId, price, quantity });
    // Sort asks ascending by price
    orderBooks[pair].asks.sort((a, b) => a.price - b.price);
  }
  return newOrder;
}

/**
 * Cancels an order in in-memory data.
 */
export function cancelOrderInMemory(pair: string, orderId: string): boolean {
  if (!orderBooks[pair]) return false;

  let idx = orderBooks[pair].bids.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orderBooks[pair].bids.splice(idx, 1);
    return true;
  }
  idx = orderBooks[pair].asks.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orderBooks[pair].asks.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Retrieves top N orders from in-memory data for a given pair.
 */
export function getOrderBookInMemory(pair: string, depth = 5) {
  if (!orderBooks[pair]) {
    return { bids: [], asks: [] };
  }
  const book = orderBooks[pair];
  const topBids = book.bids.slice(0, depth).map((b) => ({
    orderId: b.id,
    pair,
    side: 'buy' as 'buy',
    price: b.price,
    quantity: b.quantity,
    timestamp: Date.now()
  }));
  const topAsks = book.asks.slice(0, depth).map((a) => ({
    orderId: a.id,
    pair,
    side: 'sell' as 'sell',
    price: a.price,
    quantity: a.quantity,
    timestamp: Date.now()
  }));

  return { bids: topBids, asks: topAsks };
}
