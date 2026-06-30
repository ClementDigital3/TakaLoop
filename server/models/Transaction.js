const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  sellerAmount: { type: Number, default: 0 },
  mpesaRef: { type: String, default: '' },
  mpesaCheckoutId: { type: String, default: '' },
  buyerPhone: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' },
  escrowStatus: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
  deliveryStatus: { type: String, enum: ['pending', 'scheduled', 'in_transit', 'delivered', 'confirmed'], default: 'pending' },
  pickupDate: { type: Date },
  deliveryAddress: { type: String, default: '' },
  disputeRaised: { type: Boolean, default: false },
  disputeReason: { type: String, default: '' },
  disputeStatus: { type: String, enum: ['none', 'open', 'resolved'], default: 'none' },
  notes: { type: String, default: '' },
}, { timestamps: true });

transactionSchema.pre('save', function (next) {
  this.platformFee = this.amount * 0.05;
  this.sellerAmount = this.amount - this.platformFee;
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
