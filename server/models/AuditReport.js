const mongoose = require('mongoose');

const auditReportSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessDescription: { type: String, required: true },
  wasteLogInput: { type: String, default: '' },
  aiAnalysis: { type: String, required: true },
  wasteProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
  recoveryOpportunities: [{ type: String }],
  recommendations: [{ type: String }],
  certifiedHandlers: [{ name: String, contact: String, wasteTypes: [String] }],
  estimatedSavingsKes: { type: Number, default: 0 },
  carbonCreditsPotential: { type: Number, default: 0 },
  pdfUrl: { type: String, default: '' },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('AuditReport', auditReportSchema);
