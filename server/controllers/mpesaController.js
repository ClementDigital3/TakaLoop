const axios = require('axios');
const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');

const getMpesaToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const url = process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const response = await axios.get(url, { headers: { Authorization: `Basic ${auth}` } });
  return response.data.access_token;
};

exports.initiateSTKPush = async (req, res) => {
  try {
    const { phone, amount, listingId, description } = req.body;

    const listing = await WasteListing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ success: false, message: 'Listing is no longer available' });

    const transaction = await Transaction.create({
      buyer: req.user._id,
      seller: listing.seller,
      listing: listingId,
      amount,
      phone,
      status: 'pending',
    });

    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone.startsWith('+') ? phone.slice(1) : phone;

    const stkUrl = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    const stkResponse = await axios.post(stkUrl, {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `TakaLoop-${transaction._id}`,
      TransactionDesc: description || 'TakaLoop waste purchase',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await Transaction.findByIdAndUpdate(transaction._id, {
      mpesaRef: stkResponse.data.CheckoutRequestID,
      status: 'processing',
    });

    await WasteListing.findByIdAndUpdate(listingId, { status: 'reserved', buyer: req.user._id });

    res.json({
      success: true,
      message: 'STK Push sent. Check your phone to complete payment.',
      transactionId: transaction._id,
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
    });
  } catch (err) {
    console.error('M-Pesa STK Push error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment initiation failed. Please try again.' });
  }
};

exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    const transaction = await Transaction.findOne({ mpesaRef: CheckoutRequestID });
    if (!transaction) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    if (ResultCode === 0) {
      const metadata = CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value || '';

      await Transaction.findByIdAndUpdate(transaction._id, {
        status: 'escrow',
        mpesaReceiptNumber: receiptNumber,
        $push: {
          auditLog: { action: 'payment_received', timestamp: new Date() },
        },
      });

      await WasteListing.findByIdAndUpdate(transaction.listing, { 'escrow.held': true, 'escrow.mpesaRef': receiptNumber });
    } else {
      await Transaction.findByIdAndUpdate(transaction._id, { status: 'failed' });
      await WasteListing.findByIdAndUpdate(transaction.listing, { status: 'active', buyer: null });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Transaction.findByIdAndUpdate(transactionId, {
      status: 'completed',
      escrowReleasedAt: new Date(),
      $push: { auditLog: { action: 'delivery_confirmed', timestamp: new Date(), by: req.user._id } },
    });

    await WasteListing.findByIdAndUpdate(transaction.listing, {
      status: 'sold',
      'logistics.status': 'confirmed',
      'logistics.confirmedAt': new Date(),
      'escrow.releasedAt': new Date(),
    });

    res.json({ success: true, message: 'Delivery confirmed. Payment released to seller.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      query.$or = [{ buyer: req.user._id }, { seller: req.user._id }];
    }
    const transactions = await Transaction.find(query)
      .populate('buyer', 'name phone')
      .populate('seller', 'name phone')
      .populate('listing', 'title category quantity unit')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
