const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationWorker = require('./queue/notificationWorker');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/', notificationRoutes);

app.get('/health', (req, res) => res.send('Notification Service is running'));

app.listen(PORT, () => {
  console.log(`Notification Service listening on port ${PORT}`);
});
