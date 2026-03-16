const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';

app.use(cors());
app.use(morgan('dev'));

app.use('/api/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));
app.use('/api/users', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true }));
app.use('/api/notifications', createProxyMiddleware({ target: NOTIFICATION_SERVICE_URL, changeOrigin: true }));

app.get('/', (req, res) => {
  res.send('API Gateway is running.');
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
