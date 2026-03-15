const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/', authRoutes);

app.get('/health', (req, res) => res.send('Auth Service is running'));

app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
});
