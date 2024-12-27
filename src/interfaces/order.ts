export interface Order {
  orderId: string;
  pair: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: number;
  userId?: string;
}
