import { Worker, Job } from 'bullmq';
import { redisConnection } from '../redis/connection'; // Import centralized Redis connection
import { processEmail } from './emailProcessor';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Worker with centralized Redis connection
const emailWorker = new Worker(
    'emailQueue',
    async (job: Job) => {
        if (job.name.startsWith('auto-reply-')) {
            const sessionId = job.name.replace('auto-reply-', '');
            const tokensString = await redisConnection.get(`tokens:${sessionId}`);
            if (!tokensString) {
                throw new Error('Authentication tokens not found for session.');
            }
            const tokens = JSON.parse(tokensString);
            job.data = tokens; // Update job data directly
            await processEmail(job); // Pass the original job
        } else {
            await processEmail(job);
        }
    },
    { connection: redisConnection }
);

// Event listener for completed jobs
emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
});

// Event listener for failed jobs
emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});
