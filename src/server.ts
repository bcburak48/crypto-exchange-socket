import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';

// Services
import { connectRedis } from './services/redisCacheService';
import { connectRabbitMQ } from './services/rabbitmqService';
import { initOrderService } from './services/orderService';

// Middlewares
import { errorHandler } from './middlewares/errorHandler';
import { expressAuthMiddleware, checkRole } from './middlewares/authMiddleware';
import { rateLimiter } from './middlewares/throttlingMiddleware';

// Controllers
import { createOrder, deleteOrder, readOrderBook } from './controllers/orderController';

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

async function main(): Promise<void> {
  // Connect to Redis if enabled
  if (config.useRedis) {
    await connectRedis();
  }

  // Connect to RabbitMQ
  try {
    await connectRabbitMQ();
  } catch (err) {
    logger.error(`RabbitMQ connection failed: ${(err as Error).message}`);
  }

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });

  // Initialize order service with Socket.io
  initOrderService(io);

  // Basic Express config
  app.use(cors());
  app.use(express.json());

  /**
   * Example routes:
   * - Only admin users can create/delete orders.
   * - Anyone with a valid token can read the order book (or open it to the public if desired).
   */
  app.post('/orders', expressAuthMiddleware, rateLimiter, checkRole('admin'), createOrder);
  app.delete(
    '/orders/:orderId',
    expressAuthMiddleware,
    rateLimiter,
    checkRole('admin'),
    deleteOrder
  );
  app.get('/orderbook/:base/:quote', readOrderBook);

  // Debug: print all registered routes
  console.log('Registered routes:');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any)._router.stack.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${layer.route.path}`);
    }
  });

  // Express error handler
  app.use(errorHandler);

  // Socket.IO
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('subscribe', (pairs: string[]) => {
      pairs.forEach((p) => socket.join(p));
      logger.info(`Socket ${socket.id} subscribed to: ${pairs}`);
    });

    socket.on('newOrder', async (data) => {
      logger.info(`Socket new order: ${JSON.stringify(data)}`);
      try {
        // For demonstration only.
        // Ideally, you'd validate the user token/role here too if needed.
        const { pair, side, price, quantity, userId } = data;
        const result = await createSocketOrder(pair, side, price, quantity, userId);
        socket.emit('orderPlaced', result);
      } catch (err) {
        logger.error(`Socket order error: ${(err as Error).message}`);
        socket.emit('error', { message: (err as Error).message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  /**
   * Helper function for creating an order via Socket.io.
   * (Requires an authenticated/authorized approach in a real scenario.)
   */
  async function createSocketOrder(
    pair: string,
    side: 'buy' | 'sell',
    price: number,
    quantity: number,
    userId?: string
  ) {
    const finalUserId = userId || 'socket-anonymous';
    const { addOrder } = await import('./services/orderService');
    return addOrder(pair, side, price, quantity, finalUserId);
  }

  server.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} - env: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  logger.error(`Error in main(): ${err.message}`);
  process.exit(1);
});
