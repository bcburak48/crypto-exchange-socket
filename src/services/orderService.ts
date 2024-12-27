import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { CustomError } from '../utils/customErrors';
import { getRedisClient } from './redisCacheService';
import { Order } from '../interfaces/order';
import { config } from '../config';
import {
  addOrderInMemory,
  cancelOrderInMemory,
  getOrderBookInMemory,
  orderBooks
} from '../data/orderBooks';
import { notifyTradeExecuted } from './tradeService';
import { Server } from 'socket.io';

let io: Server;

export function initOrderService(ioInstance: Server) {
  io = ioInstance;
}

export async function addOrder(
  pair: string,
  side: 'buy' | 'sell',
  price: number,
  quantity: number,
  userId: string
): Promise<Order> {
  if (!pair || !side || !price || !quantity) {
    throw new CustomError('Invalid order parameters', 400);
  }

  let newOrder: Order;
  if (!config.useRedis) {
    newOrder = addOrderInMemory(pair, side, price, quantity, userId);
  } else {
    const client = getRedisClient();
    const orderId = uuidv4();
    const timestamp = Date.now();
    const orderKey = `order:${orderId}`;
    const zsetKey = `orderbook:${pair}:${side === 'buy' ? 'bids' : 'asks'}`;
    const score = side === 'buy' ? -price : price;

    await client.hSet(orderKey, {
      orderId,
      pair,
      side,
      price: String(price),
      quantity: String(quantity),
      userId,
      timestamp: String(timestamp)
    });
    await client.zAdd(zsetKey, [{ score, value: orderId }]);

    newOrder = {
      orderId,
      pair,
      side,
      price,
      quantity,
      timestamp,
      userId
    };
  }

  logger.info(`Order added: ${newOrder.orderId} - ${side} @${price} x${quantity} - pair: ${pair}`);

  await matchOrders(pair);
  io.to(pair).emit('orderBookUpdated', { pair });

  return newOrder;
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  if (!config.useRedis) {
    for (const pairKey of Object.keys(orderBooks)) {
      const canceled = cancelOrderInMemory(pairKey, orderId);
      if (canceled) {
        logger.info(`Order cancelled (in-memory): ${orderId}`);
        io.to(pairKey).emit('orderBookUpdated', { pair: pairKey });
        return true;
      }
    }
    return false;
  } else {
    const client = getRedisClient();
    const orderKey = `order:${orderId}`;
    const orderData = await client.hGetAll(orderKey);

    if (!orderData || !orderData.side || !orderData.pair) {
      throw new CustomError(`Order not found: ${orderId}`, 404);
    }

    const pair = orderData.pair;
    const side = orderData.side as 'buy' | 'sell';
    const zsetKey = `orderbook:${pair}:${side === 'buy' ? 'bids' : 'asks'}`;

    await client.zRem(zsetKey, orderId);
    await client.del(orderKey);

    logger.info(`Order cancelled: ${orderId}`);
    io.to(pair).emit('orderBookUpdated', { pair });
    return true;
  }
}

export async function getOrderBook(pair: string, depth = 5): Promise<any> {
  if (!config.useRedis) {
    return getOrderBookInMemory(pair, depth);
  }

  const client = getRedisClient();
  const bidsKey = `orderbook:${pair}:bids`;
  const asksKey = `orderbook:${pair}:asks`;

  const topBidsIds = await client.zRange(bidsKey, 0, depth - 1, { REV: true });
  const topAsksIds = await client.zRange(asksKey, 0, depth - 1);

  const pipeline = client.multi();
  topBidsIds.forEach((id) => pipeline.hGetAll(`order:${id}`));
  topAsksIds.forEach((id) => pipeline.hGetAll(`order:${id}`));

  const rawResults = await pipeline.exec();

  if (!rawResults) {
    return { bids: [], asks: [] };
  }

  const results = rawResults as unknown as Array<Record<string, string>>;

  const bidsData = results.slice(0, topBidsIds.length);
  const asksData = results.slice(topBidsIds.length);

  const mappedBids = bidsData.map((data) => mapOrderHash(data));
  const mappedAsks = asksData.map((data) => mapOrderHash(data));

  return {
    bids: mappedBids,
    asks: mappedAsks
  };
}

async function matchOrders(pair: string) {
  if (!config.useRedis) {
    const { bids, asks } = getOrderBookInMemory(pair, 1);
    if (bids.length > 0 && asks.length > 0) {
      const topBid = bids[0];
      const topAsk = asks[0];
      if (topBid.price >= topAsk.price) {
        const tradePrice = (topBid.price + topAsk.price) / 2;
        const tradeQty = Math.min(topBid.quantity, topAsk.quantity);

        const tradeData = {
          tradeId: uuidv4(),
          pair,
          price: tradePrice,
          quantity: tradeQty,
          timestamp: Date.now()
        };

        await notifyTradeExecuted(tradeData);
        io.to(pair).emit('tradeExecuted', tradeData);

        logger.info(`Trade executed (in-memory mock): ${JSON.stringify(tradeData)}`);
      }
    }
  } else {
    await matchOrdersRedis(pair);
  }
}

async function matchOrdersRedis(pair: string): Promise<void> {
  const client = getRedisClient();
  const bidsKey = `orderbook:${pair}:bids`;
  const asksKey = `orderbook:${pair}:asks`;

  while (true) {
    const topBidIds = await client.zRange(bidsKey, 0, 0, { REV: true });
    if (topBidIds.length === 0) break;

    const topAskIds = await client.zRange(asksKey, 0, 0);
    if (topAskIds.length === 0) break;

    const topBidId = topBidIds[0];
    const topAskId = topAskIds[0];

    const [bidData, askData] = await Promise.all([
      client.hGetAll(`order:${topBidId}`),
      client.hGetAll(`order:${topAskId}`)
    ]);

    if (!bidData?.price || !bidData?.quantity) break;
    if (!askData?.price || !askData?.quantity) break;

    const bidPrice = parseFloat(bidData.price);
    const bidQty = parseFloat(bidData.quantity);
    const askPrice = parseFloat(askData.price);
    const askQty = parseFloat(askData.quantity);

    if (bidPrice >= askPrice) {
      const tradePrice = (bidPrice + askPrice) / 2;
      const tradeQty = Math.min(bidQty, askQty);

      const tradeData = {
        tradeId: uuidv4(),
        pair,
        price: tradePrice,
        quantity: tradeQty,
        timestamp: Date.now(),
        bidOrderId: topBidId,
        askOrderId: topAskId
      };

      await notifyTradeExecuted(tradeData);
      io.to(pair).emit('tradeExecuted', tradeData);
      logger.info(`Trade executed (Redis-based): ${JSON.stringify(tradeData)}`);

      const newBidQty = bidQty - tradeQty;
      const newAskQty = askQty - tradeQty;

      const pipeline = client.multi();

      if (newBidQty <= 0) {
        pipeline.del(`order:${topBidId}`);
        pipeline.zRem(bidsKey, topBidId);
      } else {
        pipeline.hSet(`order:${topBidId}`, { quantity: newBidQty.toString() });
      }

      if (newAskQty <= 0) {
        pipeline.del(`order:${topAskId}`);
        pipeline.zRem(asksKey, topAskId);
      } else {
        pipeline.hSet(`order:${topAskId}`, { quantity: newAskQty.toString() });
      }

      await pipeline.exec();

      io.to(pair).emit('orderBookUpdated', { pair });
    } else {
      break;
    }
  }
}

function mapOrderHash(hashData: Record<string, string>): Order {
  return {
    orderId: hashData.orderId,
    pair: hashData.pair,
    side: hashData.side as 'buy' | 'sell',
    price: parseFloat(hashData.price),
    quantity: parseFloat(hashData.quantity),
    timestamp: parseInt(hashData.timestamp, 10),
    userId: hashData.userId
  };
}
