const express = require('express');
const router = express.Router();
const WasteListing = require('../models/WasteListing');
const DumpReport = require('../models/DumpReport');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CollectionPoint = require('../models/CollectionPoint');

// @GET /api/impact — public platform-wide impact stats
router.get('/', async (req, res) => {
  try {
    const [
      totalListings, soldListings, totalReports, resolvedReports,
      totalUsers, totalCollectors, totalTransactions,
      totalCollectionPoints, collectionPointStats
    ] = await Promise.all([
      WasteListing.countDocuments(),
      WasteListing.countDocuments({ status: 'sold' }),
      DumpReport.countDocuments(),
      DumpReport.countDocuments({ status: 'resolved' }),
      User.countDocuments(),
      User.countDocuments({ role: 'collector' }),
      Transaction.countDocuments({ paymentStatus: 'completed' }),
      CollectionPoint.countDocuments({ isActive: true }),
      CollectionPoint.aggregate([{ $group: { _id: null, totalWaste: { $sum: '$totalWasteCollected' } } }]),
    ]);

    // Total waste traded on marketplace
    const tradeStats = await WasteListing.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: null, totalKg: { $sum: '$quantity' }, totalCO2: { $sum: '$carbonOffset' }, totalValue: { $sum: '$totalPrice' } } }
    ]);

    // Transaction volume
    const txStats = await Transaction.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);

    const wasteKg = (tradeStats[0]?.totalKg || 0) + (collectionPointStats[0]?.totalWaste || 0);
    const co2Saved = tradeStats[0]?.totalCO2 || 0;
    const kesCirculated = txStats[0]?.totalAmount || 0;

    // Waste by category breakdown
    const categoryBreakdown = await WasteListing.aggregate([
      { $match: { status: 'sold' } },
      { $group: { _id: '$category', totalKg: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $sort: { totalKg: -1 } }
    ]);

    // Reports by county (heatmap data)
    const reportsByCounty = await DumpReport.aggregate([
      { $group: { _id: '$county', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        wasteKgDiverted: Math.round(wasteKg),
        co2KgSaved: Math.round(co2Saved),
        kesCirculated: Math.round(kesCirculated),
        totalUsers,
        totalCollectors,
        activeListings: totalListings - soldListings,
        totalListings,
        dumpReports: totalReports,
        dumpReportsResolved: resolvedReports,
        activeCollectionPoints: totalCollectionPoints,
        totalTransactions,
        categoryBreakdown,
        reportsByCounty,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
