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

app.set('trust proxy', 1); // Trust first proxy (Docker NAT)

// Rate Limiter
const store = new RedisStore({
  sendCommand: (...args) => redisClient.call(...args),
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: store,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  },
  skip: (req, res) => {
    const userAgent = req.get('user-agent') || '';
    return req.path === '/' && userAgent.includes('curl');
  }
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

// Router
app.use('/api/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Gateway Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
