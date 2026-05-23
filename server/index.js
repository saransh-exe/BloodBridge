const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Fix CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🩸 BloodBridge API is running!' });
});

const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const otpRoutes = require('./routes/otpRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/otp', otpRoutes);

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB Connection Failed:', error.message);
  });