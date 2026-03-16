exports.sendNotification = (req, res) => {
  try {
    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      return res.status(400).json({ error: 'Please provide userId, type, and message.' });
    }
    console.log(`[NOTIFICATION SERVICE] Sending ${type} to User ${userId}: ${message}`);

    res.status(200).json({ status: 'success', message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Server error sending notification' });
  }
};
