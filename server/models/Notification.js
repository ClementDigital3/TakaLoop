const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['points', 'transaction', 'report', 'system', 'pickup', 'audit'], default: 'system' },
  isRead: { type: Boolean, default: false },
  reference: { type: String, default: '' },
  referenceModel: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
