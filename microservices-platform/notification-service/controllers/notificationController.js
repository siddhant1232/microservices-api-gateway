const notificationQueue = require('../queue/notificationQueue');

exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'Please provide userId, type, and message.' });
    }
    // Add a job to the BullMQ queue
    const job = await notificationQueue.add('send-notification', {
      userId,
      type,
      message
    });

    console.log(`[NOTIFICATION SERVICE] Job ${job.id} enqueued for User ${userId}`);

    res.status(200).json({ status: 'success', message: 'Notification queued successfully', jobId: job.id });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Server error sending notification' });
  }
};
