import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Centralized Redis Connection for BullMQ
export const redisConnection = new IORedis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null, // Essential for BullMQ
});
