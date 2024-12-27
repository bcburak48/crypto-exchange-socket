import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config';

let redisClient: RedisClientType | null = null;

/**
 * Connects to Redis using the configuration URL.
 */
export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({ url: config.redisUrl });
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error: any) {
    logger.error(`Failed to connect to Redis: ${error.message}`);
    throw error;
  }
}

/**
 * Returns the Redis client or throws an error if not initialized.
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client is not initialized');
  }
  return redisClient;
}
