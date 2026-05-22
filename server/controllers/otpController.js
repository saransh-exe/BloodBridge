const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await OTP.create({ email, otp });

    // Send OTP email
    await sendOTPEmail(email, name, otp);

    res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP!'
      });
    }

    // Delete OTP after verification
    await OTP.deleteMany({ email });

    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendOTP, verifyOTP };