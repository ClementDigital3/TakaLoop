const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const { protect } = require('../middleware/auth');

// @GET /api/users/:id — public user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -qrCode');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const listingsCount = await WasteListing.countDocuments({ seller: user._id, status: 'active' });
    res.json({ success: true, data: { ...user.toJSON(), listingsCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/my/qr — get current user's QR code
router.get('/my/qr', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('qrCode name points');
    res.json({ success: true, qrCode: user.qrCode, name: user.name, points: user.points });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
