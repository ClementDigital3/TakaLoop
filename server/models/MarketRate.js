const mongoose = require('mongoose');

const marketRateSchema = new mongoose.Schema({
  category: { type: String, required: true },
  subCategory: { type: String, default: '' },
  minPricePerKg: { type: Number, required: true },
  maxPricePerKg: { type: Number, required: true },
  avgPricePerKg: { type: Number, required: true },
  unit: { type: String, default: 'KES/kg' },
  setBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  effectiveFrom: { type: Date, default: Date.now },
  effectiveTo: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MarketRate', marketRateSchema);
