const mongoose = require('mongoose');

const marketRateSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['plastics', 'metals', 'paper', 'ewaste', 'organics', 'hazardous', 'textiles', 'glass', 'other'],
    required: true,
    unique: true
  },
  subRates: [{
    subCategory: String,
    minPrice: Number,
    maxPrice: Number,
    averagePrice: Number,
    unit: { type: String, default: 'kg' }
  }],
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  currency: { type: String, default: 'KES' },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weeklyChange: { type: Number, default: 0 }, // % change from last week
  trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
}, { timestamps: true });

module.exports = mongoose.model('MarketRate', marketRateSchema);
