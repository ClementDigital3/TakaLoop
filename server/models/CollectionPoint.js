const mongoose = require('mongoose');

const collectionPointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    ward: String,
    county: { type: String, default: 'Nairobi' },
    coordinates: { type: [Number], default: [36.8219, -1.2921] }
  },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedWasteTypes: [{ type: String }],
  operatingHours: { type: String, default: 'Mon-Fri 8am-5pm' },
  capacity: { type: Number, default: 1000 },
  currentLoad: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  qrCode: { type: String, unique: true },
  totalWasteCollected: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  photos: [{ type: String }],
}, { timestamps: true });

collectionPointSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('CollectionPoint', collectionPointSchema);
