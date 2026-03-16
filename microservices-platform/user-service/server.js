const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/', userRoutes);

app.get('/health', (req, res) => res.send('User Service is running'));

app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
});
