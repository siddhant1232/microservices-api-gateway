const { Queue } = require('bullmq');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const notificationQueue = new Queue('notifications', {
  connection: { url: REDIS_URL }
});

module.exports = notificationQueue;
