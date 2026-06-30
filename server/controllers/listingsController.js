const WasteListing = require('../models/WasteListing');
const MarketRate = require('../models/MarketRate');

exports.getListings = async (req, res) => {
  try {
    const { category, status, listingType, county, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'active';
    if (listingType) query.listingType = listingType;
    if (county) query['location.county'] = county;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await WasteListing.countDocuments(query);
    const listings = await WasteListing.find(query)
      .populate('seller', 'name phone county isVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), listings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id)
      .populate('seller', 'name phone county ward isVerified totalWasteKg')
      .populate('buyer', 'name phone');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    listing.views += 1;
    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const listing = await WasteListing.create({
      ...req.body,
      seller: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Listing created successfully', listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await WasteListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, listing: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await WasteListing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMarketRates = async (req, res) => {
  try {
    const rates = await MarketRate.find({ isActive: true }).sort({ category: 1 });
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
