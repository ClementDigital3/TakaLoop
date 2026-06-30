const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const DumpReport = require('../models/DumpReport');
const Transaction = require('../models/Transaction');
const MarketRate = require('../models/MarketRate');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/admin/users/:id — update user (verify, change role, deactivate)
router.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/disputes
router.get('/disputes', async (req, res) => {
  try {
    const disputes = await Transaction.find({ disputeRaised: true, disputeResolvedAt: null })
      .populate('buyer', 'name phone').populate('seller', 'name phone').populate('listing', 'title').sort('-createdAt');
    res.json({ success: true, data: disputes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/admin/disputes/:id/resolve
router.patch('/disputes/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { disputeResolvedAt: new Date(), escrowStatus: resolution === 'refund' ? 'refunded' : 'released' },
      { new: true }
    );
    res.json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET/PUT /api/admin/market-rates
router.get('/market-rates', async (req, res) => {
  try {
    const rates = await MarketRate.find();
    res.json({ success: true, data: rates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/market-rates/:category', async (req, res) => {
  try {
    const rate = await MarketRate.findOneAndUpdate(
      { category: req.params.category },
      { ...req.body, lastUpdatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: rate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/overview — summary stats
router.get('/overview', async (req, res) => {
  try {
    const [users, listings, transactions, reports] = await Promise.all([
      User.countDocuments(),
      WasteListing.countDocuments(),
      Transaction.aggregate([{ $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$amount' } } }]),
      DumpReport.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, data: { users, listings, transactions, reports } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
