const mongoose = require('mongoose');

const wasteListing = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['plastics', 'metals', 'paper', 'ewaste', 'organics', 'hazardous', 'textiles', 'glass', 'other'],
    required: true
  },
  subCategory: { type: String, default: '' }, // e.g. PET, HDPE, Aluminum
  grade: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'tonnes', 'litres', 'pieces'], default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number },
  currency: { type: String, default: 'KES' },
  images: [{ type: String }],
  location: {
    county: { type: String, required: true },
    ward: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String }
  },
  listingType: { type: String, enum: ['marketplace', 'b2b'], default: 'marketplace' },
  status: {
    type: String,
    enum: ['active', 'reserved', 'sold', 'cancelled'],
    default: 'active'
  },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pickupScheduled: { type: Date },
  pickupStatus: {
    type: String,
    enum: ['not_scheduled', 'scheduled', 'in_transit', 'delivered', 'confirmed'],
    default: 'not_scheduled'
  },
  escrowHeld: { type: Boolean, default: false },
  escrowReleased: { type: Boolean, default: false },
  carbonOffset: { type: Number, default: 0 }, // kg CO2 equivalent
  views: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-calculate total price and carbon offset
wasteListing.pre('save', function (next) {
  this.totalPrice = this.quantity * this.pricePerUnit;
  // Carbon offset estimates per category (kg CO2 per kg waste)
  const carbonFactors = {
    plastics: 1.5, metals: 2.0, paper: 1.1, ewaste: 3.0,
    organics: 0.5, hazardous: 2.5, textiles: 1.2, glass: 0.3, other: 0.5
  };
  this.carbonOffset = this.quantity * (carbonFactors[this.category] || 0.5);
  next();
});

module.exports = mongoose.model('WasteListing', wasteListing);
