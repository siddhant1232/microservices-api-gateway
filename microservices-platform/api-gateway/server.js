const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables or defaults for local dev
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const redisClient = new Redis(REDIS_URL);

app.use(cors());
app.use(morgan('dev'));

// Rate Limiter
const store = new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: store,
});

app.use(limiter);

// JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Malformed token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized!' });
    }
    req.userId = decoded.user.id;
    next();
  });
};

// Routing configuration
app.use('/api/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));

// protect routes with jwt verification and rewrite paths
app.use('/users', verifyToken, createProxyMiddleware({ 
  target: USER_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: { '^/users': '' }
}));

app.use('/notify', verifyToken, createProxyMiddleware({ 
  target: NOTIFICATION_SERVICE_URL, 
  changeOrigin: true,
  pathRewrite: { '^/notify': '' }
}));

app.get('/', (req, res) => {
  res.send('API Gateway is running.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Gateway Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
