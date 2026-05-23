const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bloodbridge.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🩸 BloodBridge API is running!' });
});
const requestRoutes = require('./routes/requestRoutes');
app.use('/api/requests', requestRoutes);
const otpRoutes = require('./routes/otpRoutes');
app.use('/api/otp', otpRoutes);

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    app.listen(5000, () => {
      console.log('🚀 Server running on port 5000');
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB Connection Failed:', error.message);
  });