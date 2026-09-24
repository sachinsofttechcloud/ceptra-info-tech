const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const authRouter = require('./routes/auth');
const courseRouter = require('./routes/courses');
const adminRouter = require('./routes/admin');
const paymentRouter = require('./routes/payments');
const acknowledgementsRouter = require('./routes/acknowledgements');
const db = require('./lib/db');

const app = express();
const port = Number(process.env.PORT) || 5000;

// Simple CORS middleware to support frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Admin-Email');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/admin', adminRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/acknowledgements', acknowledgementsRouter);

db.ready.then(() => {
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });
});

