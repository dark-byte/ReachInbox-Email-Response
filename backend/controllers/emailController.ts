import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import { Request, Response } from 'express';

// Load environment variables
dotenv.config();

// Initialize BullMQ Queue
const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
const emailQueue = new Queue('emailQueue', { connection });

// In-memory log storage (for demonstration purposes)
let emailLogs: Array<{
    emailId: string;
    classification: string;
    snippet: string;
    responseEmail: string;
    timestamp: string;
}> = [];

// Enqueue email processing job
export const enqueueEmailJob = async ({ token, refreshToken }: { token?: string; refreshToken?: string }) => {
    if (!token || !refreshToken) {
        throw new Error('No access token or refresh token provided');
    }

    await emailQueue.add('processEmails', { token, refreshToken }); // Include both tokens
};

// Function to add logs
export const addLog = (log: {
    emailId: string;
    classification: string;
    snippet: string;
    responseEmail: string;
}) => {
    emailLogs.push({
        ...log,
        timestamp: new Date().toISOString(),
    });
};

// Fetch logs
export const getLogs = async () => {
    return emailLogs;
};
