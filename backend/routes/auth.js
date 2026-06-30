const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, ward, county, businessName, businessType, mpesaNumber } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or phone already registered' });
    }

    // Generate unique QR code for citizen/collector roles
    const qrId = uuidv4();
    const qrCodeDataUrl = await QRCode.toDataURL(`TAKALOOP:USER:${qrId}`);

    const user = await User.create({
      name, email, phone, password,
      role: role || 'citizen',
      ward, county, businessName, businessType, mpesaNumber,
      qrCode: qrCodeDataUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({
      success: true,
      token: generateToken(user._id),
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @PUT /api/auth/update-profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, ward, county, businessName, mpesaNumber, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, ward, county, businessName, mpesaNumber, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
