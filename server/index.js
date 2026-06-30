const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/points', require('./routes/points'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/collection-points', require('./routes/collectionPoints'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/impact', require('./routes/impact'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => res.json({ status: 'TakaLoop API running', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/takaloop')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`TakaLoop server running on port ${PORT}`));
  })
  .catch(err => console.error('DB connection error:', err));
