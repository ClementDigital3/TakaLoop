const WasteListing = require('../models/WasteListing');
const { calculateCarbonOffset } = require('../utils/carbonCalc');

exports.getListings = async (req, res) => {
  try {
    const { category, status, county, grade, minPrice, maxPrice, page=1, limit=20 } = req.query;
    const query = {};
    if (category) query.wasteCategory = category;
    if (status) query.status = status; else query.status = 'available';
    if (county) query['location.county'] = county;
    if (grade) query.grade = grade;
    if (minPrice || maxPrice) { query.pricePerUnit = {}; if (minPrice) query.pricePerUnit.$gte = +minPrice; if (maxPrice) query.pricePerUnit.$lte = +maxPrice; }
    const listings = await WasteListing.find(query).populate('seller','name phone ward county isVerified').sort('-createdAt').skip((page-1)*limit).limit(+limit);
    const total = await WasteListing.countDocuments(query);
    res.json({ success:true, count:listings.length, total, pages:Math.ceil(total/limit), listings });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id).populate('seller','name phone ward county isVerified avatar').populate('buyer','name phone');
    if (!listing) return res.status(404).json({ success:false, message:'Listing not found' });
    listing.views += 1; await listing.save();
    res.json({ success:true, listing });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.createListing = async (req, res) => {
  try {
    const data = { ...req.body, seller: req.user._id };
    data.carbonOffset = calculateCarbonOffset(data.wasteCategory, data.quantity);
    const listing = await WasteListing.create(data);
    res.status(201).json({ success:true, listing });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success:false, message:'Not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success:false, message:'Not authorized' });
    Object.assign(listing, req.body); await listing.save();
    res.json({ success:true, listing });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await WasteListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success:false, message:'Not found' });
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success:false, message:'Not authorized' });
    await listing.deleteOne();
    res.json({ success:true, message:'Listing removed' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await WasteListing.find({ seller: req.user._id }).sort('-createdAt');
    res.json({ success:true, listings });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};
