const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  wasteCategory: { type: String, required: true },
  wasteSubtype: { type: String, default: '' },
  grade: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
  pricePerKg: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  setBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
