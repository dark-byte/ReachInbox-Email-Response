import { Worker } from 'bullmq';
import { redisConnection } from '../redis/connection'; // Import centralized Redis connection
import { processEmail } from './emailProcessor';

// Initialize Worker with centralized Redis connection
const emailWorker = new Worker('emailQueue', processEmail, { connection: redisConnection });

// Event listener for completed jobs
emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has been completed`);
});

// Event listener for failed jobs
emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});
