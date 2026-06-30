const router = require('express').Router();
const MarketPrice = require('../models/MarketPrice');
const { protect, authorize } = require('../middleware/auth');
router.get('/', async (req,res) => {
  const prices = await MarketPrice.find({isActive:true}).sort('wasteCategory');
  res.json({success:true,prices});
});
router.post('/', protect, authorize('admin', 'officer'), async (req,res) => {
  const price = await MarketPrice.create({...req.body,setBy:req.user._id});
  res.status(201).json({success:true,price});
});
module.exports = router;
