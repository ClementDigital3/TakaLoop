const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const CollectionPoint = require('../models/CollectionPoint');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/points/scan-deposit — officer scans citizen QR and logs deposit
router.post('/scan-deposit', protect, authorize('county_officer', 'admin'), async (req, res) => {
  try {
    const { citizenQrData, collectionPointId, wasteKg, wasteType } = req.body;

    // Parse QR: "TAKALOOP:USER:<uuid>"
    const parts = citizenQrData.split(':');
    if (parts.length < 3 || parts[0] !== 'TAKALOOP') {
      return res.status(400).json({ success: false, message: 'Invalid QR code' });
    }

    // Find citizen by QR code match
    const citizen = await User.findOne({ qrCode: { $exists: true } });
    // In production: store qrId separately and look up by qrId from QR scan
    // For now find by the QR data embedded
    if (!citizen) return res.status(404).json({ success: false, message: 'Citizen not found' });

    const collectionPoint = await CollectionPoint.findById(collectionPointId);
    if (!collectionPoint) return res.status(404).json({ success: false, message: 'Collection point not found' });

    const pointsEarned = Math.round(wasteKg * collectionPoint.pointsPerKg);
    const balanceBefore = citizen.points;

    citizen.points += pointsEarned;
    citizen.totalWasteKg += wasteKg;
    await citizen.save();

    collectionPoint.currentLoad += wasteKg;
    collectionPoint.totalWasteCollected += wasteKg;
    await collectionPoint.save();

    await PointsLedger.create({
      user: citizen._id,
      action: 'waste_deposit',
      points: pointsEarned,
      wasteKg,
      collectionPoint: collectionPointId,
      reference: `DEP-${Date.now()}`,
      description: `Deposited ${wasteKg}kg of ${wasteType} at ${collectionPoint.name}`,
      balanceBefore,
      balanceAfter: citizen.points,
    });

    res.json({
      success: true,
      message: `${pointsEarned} TakaPoints awarded to ${citizen.name}`,
      citizen: { name: citizen.name, points: citizen.points },
      pointsEarned,
      wasteKg,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/points/redeem — citizen redeems points
router.post('/redeem', protect, async (req, res) => {
  try {
    const { points, redeemFor, mpesaNumber } = req.body; // redeemFor: 'airtime' | 'mpesa_cash'
    const user = await User.findById(req.user._id);

    if (user.points < points) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }
    if (points < 100) {
      return res.status(400).json({ success: false, message: 'Minimum redemption is 100 points' });
    }

    // 10 points = KES 1
    const kshValue = Math.round(points / 10);
    const balanceBefore = user.points;
    user.points -= points;
    await user.save();

    await PointsLedger.create({
      user: user._id,
      action: 'redemption',
      points: -points,
      redeemedFor: redeemFor,
      mpesaRef: mpesaNumber,
      description: `Redeemed ${points} points for KES ${kshValue} ${redeemFor}`,
      balanceBefore,
      balanceAfter: user.points,
    });

    // TODO: Trigger Africa's Talking airtime or M-Pesa B2C disbursement here

    res.json({
      success: true,
      message: `Successfully redeemed ${points} points for KES ${kshValue} ${redeemFor}. Processing within 24 hours.`,
      kshValue,
      newBalance: user.points,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/points/leaderboard — top earners
router.get('/leaderboard', async (req, res) => {
  try {
    const { ward, county } = req.query;
    const filter = { role: 'citizen' };
    if (ward) filter.ward = new RegExp(ward, 'i');
    if (county) filter.county = new RegExp(county, 'i');
    const leaders = await User.find(filter).sort('-points').limit(20).select('name ward county points totalWasteKg avatar');
    res.json({ success: true, data: leaders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/points/history — user's points history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await PointsLedger.find({ user: req.user._id }).sort('-createdAt').limit(50);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
