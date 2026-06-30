const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');
const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const { protect } = require('../middleware/auth');

// ─── M-Pesa Helpers ────────────────────────────────────────────────────────────
const getMpesaToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
};

const stkPush = async (phone, amount, accountRef, description) => {
  const token = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

  const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone.startsWith('+') ? phone.slice(1) : phone;

  const res = await axios.post(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: description,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// @POST /api/transactions — initiate purchase (STK Push)
router.post('/', protect, async (req, res) => {
  try {
    const { listingId, mpesaPhone } = req.body;
    const listing = await WasteListing.findById(listingId).populate('seller');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ success: false, message: 'Listing is no longer available' });
    if (listing.seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot buy your own listing' });
    }

    const phone = mpesaPhone || req.user.mpesaNumber;
    const stkResponse = await stkPush(phone, listing.totalPrice, `TKL-${listing._id.toString().slice(-6)}`, `TakaLoop: ${listing.title}`);

    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: listing.seller._id,
      listing: listing._id,
      amount: listing.totalPrice,
      mpesaPhone: phone,
      mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
      escrowStatus: 'pending',
      paymentStatus: 'processing',
    });

    // Reserve the listing
    listing.status = 'reserved';
    listing.buyer = req.user._id;
    await listing.save();

    res.status(201).json({
      success: true,
      message: 'STK Push sent. Check your phone to complete payment.',
      transaction,
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/transactions/mpesa/callback — M-Pesa webhook
router.post('/mpesa/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const callbackData = Body.stkCallback;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    const transaction = await Transaction.findOne({ mpesaCheckoutRequestId: checkoutRequestId });
    if (!transaction) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    if (resultCode === 0) {
      // Payment successful
      const items = callbackData.CallbackMetadata?.Item || [];
      const getVal = (name) => items.find(i => i.Name === name)?.Value;

      transaction.mpesaReceiptNumber = getVal('MpesaReceiptNumber');
      transaction.mpesaTransactionDate = String(getVal('TransactionDate'));
      transaction.paymentStatus = 'completed';
      transaction.escrowStatus = 'held';
      await transaction.save();

      // Update listing
      await WasteListing.findByIdAndUpdate(transaction.listing, { status: 'sold', escrowHeld: true });

      // Award points to seller
      const seller = await User.findById(transaction.seller);
      const pointsEarned = Math.round(transaction.sellerAmount / 100);
      seller.points += pointsEarned;
      await seller.save();
      await PointsLedger.create({
        user: seller._id,
        action: 'marketplace_sale',
        points: pointsEarned,
        reference: transaction._id.toString(),
        description: `Sale on TakaLoop marketplace`,
        balanceBefore: seller.points - pointsEarned,
        balanceAfter: seller.points,
      });
    } else {
      // Payment failed
      transaction.paymentStatus = 'failed';
      await transaction.save();
      await WasteListing.findByIdAndUpdate(transaction.listing, { status: 'active', buyer: null });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// @POST /api/transactions/:id/confirm-delivery — buyer confirms receipt
router.post('/:id/confirm-delivery', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    transaction.escrowStatus = 'released';
    transaction.escrowReleased = true;
    transaction.pickupConfirmedAt = new Date();
    await transaction.save();
    await WasteListing.findByIdAndUpdate(transaction.listing, { escrowReleased: true });
    res.json({ success: true, message: 'Delivery confirmed. Payment released to seller.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/transactions/:id/raise-dispute
router.post('/:id/raise-dispute', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { disputeRaised: true, disputeReason: reason },
      { new: true }
    );
    res.json({ success: true, message: 'Dispute raised. Our team will review within 24 hours.', transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/transactions/my — user's transactions
router.get('/my', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    }).populate('listing', 'title category quantity unit').populate('buyer', 'name').populate('seller', 'name').sort('-createdAt');
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
