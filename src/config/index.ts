import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'secretKey',
  rabbitMqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  useRedis: process.env.USE_REDIS === 'true' // true => use Redis, false => use in-memory data
};
