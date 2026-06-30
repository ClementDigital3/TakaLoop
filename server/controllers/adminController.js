const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const Transaction = require('../models/Transaction');
const DumpReport = require('../models/DumpReport');
const AuditReport = require('../models/AuditReport');

exports.getDashboard = async (req,res) => {
  try {
    const isOfficer = req.user?.role === 'officer';
    const county = isOfficer ? req.user.county : req.query.county;

    const userQuery = county ? { county } : {};
    const listingQuery = county ? { 'location.county': county, status: 'available' } : { status: 'available' };
    const reportQuery = (isOfficer && req.user.ward)
      ? { 'location.ward': req.user.ward, status: 'pending' }
      : (county ? { 'location.county': county, status: 'pending' } : { status: 'pending' });
    const verificationQuery = county
      ? { county, isVerified: false, role: { $in: ['collector', 'business'] } }
      : { isVerified: false, role: { $in: ['collector', 'business'] } };

    const txQuery = { paymentStatus: 'completed' };
    const disputeQuery = { disputeStatus: 'open' };

    if (county) {
      const countyListings = await WasteListing.find({ 'location.county': county }).select('_id');
      const listingIds = countyListings.map(l => l._id);
      txQuery.listing = { $in: listingIds };
      disputeQuery.listing = { $in: listingIds };
    }

    const [users,listings,transactions,reports,disputes,pendingVerifications] = await Promise.all([
      User.countDocuments(userQuery),
      WasteListing.countDocuments(listingQuery),
      Transaction.countDocuments(txQuery),
      DumpReport.countDocuments(reportQuery),
      Transaction.countDocuments(disputeQuery),
      User.countDocuments(verificationQuery)
    ]);
    res.json({success:true,dashboard:{users,listings,transactions,pendingReports:reports,openDisputes:disputes,pendingVerifications}});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.getUsers = async (req,res) => {
  try {
    const {role,page=1,limit=20,search,county} = req.query;
    const query={};
    if(role) query.role=role;
    if(search) query.$or=[{name:{$regex:search,$options:'i'}},{email:{$regex:search,$options:'i'}},{phone:{$regex:search,$options:'i'}}];
    const userCounty = req.user?.role === 'officer' ? req.user.county : county;
    if(userCounty) {
      query.county = userCounty;
    }
    const users = await User.find(query).select('-password').sort('-createdAt').skip((page-1)*limit).limit(+limit);
    const total = await User.countDocuments(query);
    res.json({success:true,users,total,pages:Math.ceil(total/limit)});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.verifyUser = async (req,res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,{isVerified:true},{new:true}).select('-password');
    res.json({success:true,user,message:'User verified'});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.toggleUserStatus = async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive; await user.save();
    res.json({success:true,message:`User ${user.isActive?'activated':'deactivated'}`});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};

exports.resolveDispute = async (req,res) => {
  try {
    const {resolution} = req.body;
    const tx = await Transaction.findByIdAndUpdate(req.params.id,{disputeStatus:'resolved'},{new:true});
    res.json({success:true,tx,message:'Dispute resolved'});
  } catch(e){res.status(500).json({success:false,message:e.message});}
};
