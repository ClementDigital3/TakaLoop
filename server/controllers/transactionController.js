const Transaction = require('../models/Transaction');
const WasteListing = require('../models/WasteListing');
const User = require('../models/User');
const { stkPush } = require('../utils/mpesa');
const { sendSMS } = require('../utils/sms');
const Notification = require('../models/Notification');

exports.initiatePurchase = async (req, res) => {
  try {
    const { listingId, buyerPhone, pickupDate, deliveryAddress } = req.body;
    const listing = await WasteListing.findById(listingId).populate('seller');
    if (!listing || listing.status !== 'available') return res.status(400).json({ success:false, message:'Listing not available' });
    const transaction = await Transaction.create({
      buyer: req.user._id, seller: listing.seller._id, listing: listingId,
      amount: listing.totalPrice, buyerPhone, pickupDate, deliveryAddress
    });
    try {
      const mpesa = await stkPush({ phone: buyerPhone, amount: listing.totalPrice, reference: `TL-${transaction._id.toString().slice(-6)}`, description: `TakaLoop: ${listing.title}` });
      transaction.mpesaCheckoutId = mpesa.CheckoutRequestID;
      await transaction.save();
    } catch(mpesaErr) { console.log('M-Pesa STK error (sandbox):', mpesaErr.message); }
    listing.status = 'reserved'; listing.buyer = req.user._id; await listing.save();
    await Notification.create({ user: listing.seller._id, title:'New Order!', message:`${req.user.name} wants to buy your ${listing.title}`, type:'transaction', reference:transaction._id.toString() });
    res.status(201).json({ success:true, transaction, message:'Payment initiated. Check your phone for M-Pesa prompt.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const stk = Body?.stkCallback;
    if (!stk) return res.json({ success:true });
    const transaction = await Transaction.findOne({ mpesaCheckoutId: stk.CheckoutRequestID });
    if (!transaction) return res.json({ success:true });
    if (stk.ResultCode === 0) {
      const meta = stk.CallbackMetadata?.Item || [];
      const mpesaRef = meta.find(i=>i.Name==='MpesaReceiptNumber')?.Value || '';
      transaction.mpesaRef = mpesaRef; transaction.paymentStatus = 'completed'; transaction.escrowStatus = 'held';
      await transaction.save();
      const listing = await WasteListing.findById(transaction.listing);
      if (listing) { listing.escrowAmount = transaction.amount; listing.escrowStatus = 'held'; await listing.save(); }
      await sendSMS(transaction.buyerPhone, `TakaLoop: Payment of KES ${transaction.amount} received. Ref: ${mpesaRef}. Arrange pickup to release funds.`);
    } else {
      transaction.paymentStatus = 'failed';
      const listing = await WasteListing.findById(transaction.listing);
      if (listing) { listing.status = 'available'; listing.buyer = null; await listing.save(); }
      await transaction.save();
    }
    res.json({ success:true });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('seller buyer listing');
    if (!transaction) return res.status(404).json({ success:false, message:'Not found' });
    if (transaction.buyer._id.toString() !== req.user._id.toString()) return res.status(403).json({ success:false, message:'Not authorized' });
    transaction.deliveryStatus = 'confirmed'; transaction.escrowStatus = 'released'; await transaction.save();
    const listing = await WasteListing.findById(transaction.listing._id);
    if (listing) { listing.escrowStatus = 'released'; listing.status = 'sold'; await listing.save(); }
    const seller = await User.findById(transaction.seller._id);
    if (seller) { seller.carbonCredits += listing?.carbonOffset || 0; await seller.save(); }
    await Notification.create({ user: transaction.seller._id, title:'Funds Released!', message:`KES ${transaction.sellerAmount} will be sent to your M-Pesa shortly.`, type:'transaction' });
    res.json({ success:true, message:'Delivery confirmed. Funds released to seller.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ $or:[{buyer:req.user._id},{seller:req.user._id}] }).populate('listing','title wasteCategory quantity').populate('buyer','name').populate('seller','name').sort('-createdAt');
    res.json({ success:true, transactions });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success:false, message:'Not found' });
    transaction.disputeRaised = true; transaction.disputeReason = reason; transaction.disputeStatus = 'open'; await transaction.save();
    res.json({ success:true, message:'Dispute raised. Admin will review within 24 hours.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};
