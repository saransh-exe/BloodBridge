const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, age, phone, city, hospitalName, licenseNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hospitals need approval
    const isApproved = role === 'donor' ? true : false;
    const approvalStatus = role === 'donor' ? 'approved' : 'pending';

    const user = await User.create({
      name, email, password, role,
      bloodGroup, age, phone, city,
      hospitalName, licenseNumber,
      isVerified: true,
      isApproved,
      approvalStatus
    });

    // If hospital - don't give dashboard access yet
    if (role === 'hospital') {
      return res.status(201).json({
        success: true,
        pending: true,
        message: 'Your hospital registration is under review. You will be approved within 24 hours!'
      });
    }

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        city: user.city,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block unapproved hospitals
    if (user.role === 'hospital' && !user.isApproved) {
      return res.status(403).json({
        message: 'Your hospital is pending approval. Please wait up to 24 hours.',
        pending: true
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        city: user.city,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { register, login };