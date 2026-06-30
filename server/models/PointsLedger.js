const mongoose = require('mongoose');

const pointsLedgerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['deposit_waste', 'dump_report', 'referral', 'purchase', 'redeem_airtime', 'redeem_cash', 'bonus', 'penalty'],
    required: true
  },
  points: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reference: { type: String, default: '' },
  description: { type: String, default: '' },
  balanceAfter: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('PointsLedger', pointsLedgerSchema);
