const mongoose = require('mongoose');

const dumpReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photos: [{ type: String }],
  location: {
    address: { type: String, required: true },
    ward: String,
    county: { type: String, default: 'Nairobi' },
    coordinates: { type: [Number], default: [36.8219, -1.2921] }
  },
  wasteTypes: [{ type: String }],
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  estimatedVolume: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  resolvedAt: Date,
  pointsAwarded: { type: Number, default: 50 },
  pointsReleased: { type: Boolean, default: false },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

dumpReportSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('DumpReport', dumpReportSchema);
