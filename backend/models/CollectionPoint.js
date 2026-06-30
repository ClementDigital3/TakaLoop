const mongoose = require('mongoose');

const collectionPointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // county officer in charge
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: true },
  county: { type: String, required: true },
  ward: { type: String },
  acceptedWasteTypes: [{ type: String }],
  openingHours: { type: String, default: 'Mon-Fri 8AM-5PM' },
  capacity: { type: Number, default: 1000 }, // max KG
  currentLoad: { type: Number, default: 0 },
  qrCode: { type: String },  // unique QR for this collection point
  qrCodeId: { type: String, unique: true }, // short unique ID embedded in QR
  isActive: { type: Boolean, default: true },
  totalWasteCollected: { type: Number, default: 0 }, // all time KG
  pointsPerKg: { type: Number, default: 10 }, // TakaPoints per KG deposited
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CollectionPoint', collectionPointSchema);
