const mongoose = require('mongoose');

const pointsLedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'waste_deposit',      // Deposited waste at collection point
      'dump_report',        // Reported illegal dump site
      'marketplace_sale',   // Sold waste on marketplace
      'referral',           // Referred a new user
      'profile_complete',   // Completed profile
      'redemption',         // Redeemed points
      'bonus',              // Admin bonus
      'adjustment'          // Admin adjustment
    ],
    required: true
  },
  points: { type: Number, required: true }, // positive = earned, negative = spent
  balanceBefore: { type: Number, default: 0 },
  balanceAfter: { type: Number, default: 0 },
  reference: { type: String }, // transaction ID, report ID, etc.
  description: { type: String },
  wasteKg: { type: Number, default: 0 }, // for deposit actions
  collectionPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectionPoint' },
  redeemedFor: { type: String, enum: ['airtime', 'mpesa_cash', 'voucher', ''], default: '' },
  mpesaRef: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PointsLedger', pointsLedgerSchema);
