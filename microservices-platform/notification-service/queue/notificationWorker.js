const { Worker } = require('bullmq');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const worker = new Worker('notifications', async (job) => {
  const { userId, type, message } = job.data;
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('\\n===========================================');
  console.log(`[BULLMQ WORKER] Processing Job ID: ${job.id}`);
  console.log(`[BULLMQ WORKER] Sending ${type} to User ${userId}`);
  console.log(`[BULLMQ WORKER] Message: ${message}`);
  console.log('===========================================\\n');
  
  return { status: 'success' };
}, { connection: { url: REDIS_URL } });

worker.on('completed', (job) => {
  console.log(`[BULLMQ WORKER] Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`[BULLMQ WORKER] Job ${job.id} has failed with ${err.message}`);
});

module.exports = worker;
