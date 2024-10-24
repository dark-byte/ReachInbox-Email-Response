import { redisConnection } from '../redis/connection';
import { Queue } from 'bullmq';

const emailQueue = new Queue('emailQueue', { connection: redisConnection });

export const enableAutoReplyService = async (sessionId: string): Promise<void> => {
    const tokensString = await redisConnection.get(`tokens:${sessionId}`);
    if (!tokensString) {
        throw new Error('Authentication tokens not found.');
    }

    const jobName = `auto-reply-${sessionId}`;

    await emailQueue.add(
        'processEmails',
        { sessionId },
        {
            repeat: { every: 1 * 30 * 1000 },
            jobId: jobName,
            removeOnComplete: true,
            removeOnFail: true,
        }
    );
};
