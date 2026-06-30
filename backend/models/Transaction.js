const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'KES' },
  platformFee: { type: Number, default: 0 }, // 3% of amount
  sellerAmount: { type: Number },
  // M-Pesa
  mpesaPhone: { type: String },
  mpesaCheckoutRequestId: { type: String },
  mpesaReceiptNumber: { type: String },
  mpesaTransactionDate: { type: String },
  // Escrow
  escrowStatus: {
    type: String,
    enum: ['pending', 'held', 'released', 'refunded'],
    default: 'pending'
  },
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // Pickup
  pickupDate: { type: Date },
  pickupConfirmedAt: { type: Date },
  notes: { type: String, default: '' },
  disputeRaised: { type: Boolean, default: false },
  disputeReason: { type: String },
  disputeResolvedAt: { type: Date },
}, { timestamps: true });

// Auto-calculate fees
transactionSchema.pre('save', function (next) {
  this.platformFee = Math.round(this.amount * 0.03);
  this.sellerAmount = this.amount - this.platformFee;
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
