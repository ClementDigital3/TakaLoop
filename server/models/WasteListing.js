const mongoose = require('mongoose');

const wasteListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  wasteCategory: {
    type: String,
    enum: ['plastics', 'metals', 'paper', 'ewaste', 'organics', 'hazardous', 'glass', 'textiles', 'rubber', 'other'],
    required: true
  },
  wasteSubtype: { type: String, default: '' },
  grade: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'tonnes', 'pieces', 'litres'], default: 'kg' },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number },
  description: { type: String, default: '' },
  images: [{ type: String }],
  location: {
    address: { type: String, required: true },
    ward: String,
    county: { type: String, default: 'Nairobi' },
    coordinates: { type: [Number], default: [36.8219, -1.2921] }
  },
  status: { type: String, enum: ['available', 'reserved', 'sold', 'cancelled'], default: 'available' },
  listingType: { type: String, enum: ['sell', 'exchange', 'donate'], default: 'sell' },
  pickupAvailable: { type: Boolean, default: true },
  deliveryAvailable: { type: Boolean, default: false },
  availableFrom: { type: Date, default: Date.now },
  availableTo: { type: Date },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escrowAmount: { type: Number, default: 0 },
  escrowStatus: { type: String, enum: ['none', 'held', 'released', 'refunded'], default: 'none' },
  carbonOffset: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

wasteListingSchema.pre('save', function (next) {
  this.totalPrice = this.quantity * this.pricePerUnit;
  const kgPerUnit = this.unit === 'tonnes' ? 1000 : this.unit === 'kg' ? 1 : 0.5;
  this.carbonOffset = this.quantity * kgPerUnit * 0.5;
  next();
});

module.exports = mongoose.model('WasteListing', wasteListingSchema);
