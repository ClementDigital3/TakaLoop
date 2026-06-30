const mongoose = require('mongoose');

const auditReportSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String },
  industryType: { type: String },
  operationsDescription: { type: String, required: true },
  wasteVolume: { type: String },
  currentDisposalMethods: { type: String },
  // AI Analysis Results
  aiAnalysis: {
    wasteProfile: [{ category: String, estimatedKg: Number, percentage: Number }],
    recoverableWaste: [{ material: String, estimatedKg: Number, potentialValue: Number }],
    recommendations: [{ action: String, priority: String, estimatedSaving: String }],
    certifiedHandlers: [{ name: String, location: String, contact: String, wasteTypes: [String] }],
    carbonFootprint: { current: Number, potential: Number, unit: String },
    complianceScore: { type: Number, min: 0, max: 100 },
    summary: String,
  },
  carbonCreditsEarned: { type: Number, default: 0 },
  pdfUrl: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  tokensUsed: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('AuditReport', auditReportSchema);
