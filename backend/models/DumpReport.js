const mongoose = require('mongoose');

const dumpReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photos: [{ type: String }],
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  county: { type: String, required: true },
  ward: { type: String },
  wasteTypes: [{ type: String }], // what types of waste are there
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  estimatedVolume: { type: String }, // e.g. "small pile", "truck load"
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  resolvedAt: { type: Date },
  resolutionNotes: { type: String },
  pointsAwarded: { type: Boolean, default: false },
  pointsAmount: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // community verification
  isValid: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('DumpReport', dumpReportSchema);
