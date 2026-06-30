const express = require('express');
const router = express.Router();
const WasteListing = require('../models/WasteListing');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/listings — get all active listings (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, county, listingType, minPrice, maxPrice, grade, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (county) filter['location.county'] = new RegExp(county, 'i');
    if (listingType) filter.listingType = listingType;
    if (grade) filter.grade = grade;
    if (status) filter.status = status;
    else filter.status = 'active';
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      WasteListing.find(filter).populate('seller', 'name phone county verificationBadge').sort('-createdAt').skip(skip).limit(Number(limit)),
      WasteListing.countDocuments(filter)
    ]);

    res.json({ success: true, data: listings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/listings/:id — single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await WasteListing.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('seller', 'name phone county ward verificationBadge createdAt').populate('buyer', 'name phone');
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/listings — create listing
router.post('/', protect, authorize('collector', 'business', 'recycler', 'admin'), async (req, res) => {
  try {
    const listing = await WasteListing.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/listings/:id — update listing
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await WasteListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await listing.deleteOne();
    res.json({ success: true, message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/listings/my/listings — current user's listings
router.get('/my/listings', protect, async (req, res) => {
  try {
    const listings = await WasteListing.find({ seller: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
