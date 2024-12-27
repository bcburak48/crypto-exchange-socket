import { logger } from '../utils/logger';
import { getChannel } from './rabbitmqService';

/**
 * Publishes a trade execution event to RabbitMQ and logs it.
 */
export async function notifyTradeExecuted(tradeData: any): Promise<void> {
  const channel = getChannel();
  const queueName = 'tradeQueue';

  await channel.assertQueue(queueName, { durable: true });
  const message = JSON.stringify(tradeData);

  channel.sendToQueue(queueName, Buffer.from(message));
  logger.info(`Trade executed, published to RabbitMQ: ${message}`);
}
