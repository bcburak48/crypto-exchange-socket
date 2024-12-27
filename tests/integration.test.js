"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redisCacheService_1 = require("../src/services/redisCacheService");
const orderService_1 = require("../src/services/orderService");
const uuid_1 = require("uuid");
describe('OrderService - Redis integration tests', () => {
    beforeAll(async () => {
        // Connect to Redis before tests
        await (0, redisCacheService_1.connectRedis)();
    });
    afterAll(async () => {
        // Quit Redis after all tests
        const client = (0, redisCacheService_1.getRedisClient)();
        await client.quit();
    });
    it('should add and cancel an order', async () => {
        const orderId = (0, uuid_1.v4)();
        const userId = 'testUser';
        const pair = 'BTC/USDT';
        // Add
        const order = await (0, orderService_1.addOrder)(pair, 'buy', 30000, 1.0, userId);
        expect(order.pair).toBe(pair);
        expect(order.side).toBe('buy');
        // Cancel
        const result = await (0, orderService_1.cancelOrder)(order.orderId);
        expect(result).toBe(true);
    });
});
