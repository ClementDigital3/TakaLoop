const mongoose = require('mongoose');

const wasteDepositSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collectionPoint: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectionPoint', required: true },
  officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteType: { type: String, required: true },
  weightKg: { type: Number, required: true },
  pointsAwarded: { type: Number, required: true },
  carbonOffset: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('WasteDeposit', wasteDepositSchema);
