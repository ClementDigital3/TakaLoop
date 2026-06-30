const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
router.get('/profile', protect, async (req,res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({success:true,user});
});
router.put('/profile', protect, async (req,res) => {
  const {name,ward,county,businessName,businessType} = req.body;
  const user = await User.findByIdAndUpdate(req.user._id,{name,ward,county,businessName,businessType},{new:true}).select('-password');
  res.json({success:true,user});
});
module.exports = router;
