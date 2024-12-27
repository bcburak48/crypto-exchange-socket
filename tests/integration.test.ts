import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

describe('Redis Order Tests', () => {
  const baseURL = `http://localhost:${config.port}`;
  let adminToken: string;

  beforeAll(() => {
    const secret = config.jwtSecret;
    const adminPayload = { sub: 'testUser', role: 'admin' };
    adminToken = jwt.sign(adminPayload, secret, { expiresIn: '1h' });
  });

  it('should create multiple orders for ETH/USDT', async () => {
    // We'll create 3 buy orders for ETH/USDT
    for (let i = 1; i <= 3; i++) {
      const createRes = await axios.post(
        `${baseURL}/orders`,
        {
          pair: 'ETH/USDT', // changed here
          side: 'buy',
          price: 2000 + i * 10,
          quantity: i * 0.1
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      expect(createRes.status).toBe(200);
      expect(createRes.data).toHaveProperty('orderId');
    }
  });

  it('should read the orderbook for ETH/USDT and see newly created orders', async () => {
    const res = await axios.get(`${baseURL}/orderbook/ETH/USDT`);
    expect(res.status).toBe(200);
    expect(res.data.bids.length).toBeGreaterThanOrEqual(3);
  });
});
