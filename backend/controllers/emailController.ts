import { Queue, JobsOptions } from 'bullmq';
import dotenv from 'dotenv';
import { redisConnection } from '../redis/connection';
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express';

// Load environment variables
dotenv.config();

// Initialize BullMQ Queue
const emailQueue = new Queue('emailQueue', { connection: redisConnection });

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

    await emailQueue.add('processEmails', { token, refreshToken }, {
        // Job options can be added here if needed
    });
};

// Function to enable auto-reply by adding a recurring job
export const enableAutoReply: RequestHandler = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;

        // Retrieve tokens from Redis
        const tokensString = await redisConnection.get(`tokens:${sessionId}`);
        if (!tokensString) {
            res.status(400).json({ error: 'Authentication tokens not found.' });
            return;
        }
        const tokens = JSON.parse(tokensString);

        const jobName = `auto-reply-${sessionId}`;

        // Add a recurring job that runs every 5 minutes
        await emailQueue.add(
            jobName,
            { sessionId },
            {
                repeat: { every: 5 * 60 * 1000 }, // Every 5 minutes
                jobId: jobName,
            }
        );
        res.json({ success: true, message: 'Auto-reply enabled.' });
    } catch (error) {
        next(error);
    }
};

// Function to disable auto-reply by removing the recurring job
export const disableAutoReply: RequestHandler = async (req, res, next) => {
    const sessionId = req.sessionID;
    const jobName = `auto-reply-${sessionId}`;

    try {
        const jobs = await emailQueue.getRepeatableJobs();
        const job = jobs.find(j => j.name === jobName);

        if (job) {
            await emailQueue.removeRepeatableByKey(job.key);
            res.json({ message: 'Auto-reply disabled.' });
            return; // Ensure the function returns void
        } else {
            res.status(400).json({ error: 'Auto-reply is not enabled.' });
            return; // Ensure the function returns void
        }
    } catch (error) {
        console.error('Error disabling auto-reply:', error);
        res.status(500).json({ error: 'Failed to disable auto-reply.' });
        return; // Ensure the function returns void
    }
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

// Function to get auto-reply status
export const getAutoReplyStatus = async (req: Request, res: Response) => {
    const sessionId = req.sessionID;
    const jobName = `auto-reply-${sessionId}`;

    try {
        const jobs = await emailQueue.getRepeatableJobs();
        const job = jobs.find(j => j.name === jobName);
        res.json({ isEnabled: !!job });
    } catch (error) {
        console.error('Error fetching auto-reply status:', error);
        res.status(500).json({ error: 'Failed to fetch auto-reply status.' });
    }
};
