const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// In-memory mock database for users since no DB was specified.
const users = [];

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    const { Queue } = require('bullmq');
    const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
    const notificationQueue = new Queue('notifications', {
      connection: { url: REDIS_URL }
    });

    // Send event to Notification Service asynchronously via BullMQ
    try {
      const job = await notificationQueue.add('send-notification', {
        userId: newUser.id,
        type: 'email',
        message: `Welcome ${username}! You have successfully registered.`
      });
      console.log(`[AUTH SERVICE] Notification job ${job.id} enqueued for user ${newUser.id}`);
    } catch (notifErr) {
      console.error('[AUTH SERVICE] Failed to enqueue notification:', notifErr.message);
    }
    
    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: payload.user });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
