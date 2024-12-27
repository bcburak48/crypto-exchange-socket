import amqplib, { Connection, Channel } from 'amqplib';
import { logger } from '../utils/logger';
import { config } from '../config';

let connection: Connection | null = null;
let channel: Channel | null = null;

/**
 * Connects to RabbitMQ with optional retry logic.
 */
export async function connectRabbitMQ(retries = 5, delayMs = 5000): Promise<void> {
  while (retries > 0) {
    try {
      connection = await amqplib.connect(config.rabbitMqUrl);
      channel = await connection.createChannel();
      logger.info('Connected to RabbitMQ');
      return;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`RabbitMQ connection error: ${error.message}`);
      } else {
        logger.error(`RabbitMQ connection error: ${JSON.stringify(error)}`);
      }
      retries--;
      if (retries === 0) {
        throw new Error('Failed to connect to RabbitMQ after multiple attempts');
      }
      logger.info(`Retrying in ${delayMs} ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Returns the current RabbitMQ channel, or throws an error if not initialized.
 */
export function getChannel(): Channel {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
}
