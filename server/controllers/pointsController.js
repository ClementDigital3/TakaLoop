const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const WasteDeposit = require('../models/WasteDeposit');
const CollectionPoint = require('../models/CollectionPoint');
const { sendSMS } = require('../utils/sms');
const { calculateCarbonOffset } = require('../utils/carbonCalc');

const POINTS_MAP = { deposit_waste:10, dump_report:50, referral:200, bonus:100 };

exports.awardPoints = async (userId, action, reference='', description='') => {
  const user = await User.findById(userId);
  if (!user) return null;
  const pts = POINTS_MAP[action] || 10;
  user.points += pts; await user.save();
  const ledger = await PointsLedger.create({ user:userId, action, points:pts, type:'credit', reference, description, balanceAfter:user.points });
  return ledger;
};

exports.recordDeposit = async (req, res) => {
  try {
    const { citizenQR, wasteType, weightKg, collectionPointId, notes } = req.body;
    const citizen = await User.findOne({ qrCode: { $regex: citizenQR } });
    if (!citizen) return res.status(404).json({ success:false, message:'Citizen QR not found' });
    const cp = await CollectionPoint.findById(collectionPointId);
    if (!cp) return res.status(404).json({ success:false, message:'Collection point not found' });
    const pts = Math.floor(weightKg * 10);
    const carbonOffset = calculateCarbonOffset(wasteType, weightKg);
    citizen.points += pts; citizen.totalWasteKg += weightKg; await citizen.save();
    cp.currentLoad += weightKg; cp.totalWasteCollected += weightKg; cp.totalDeposits += 1; await cp.save();
    await WasteDeposit.create({ citizen:citizen._id, collectionPoint:collectionPointId, officer:req.user._id, wasteType, weightKg, pointsAwarded:pts, carbonOffset, notes });
    await PointsLedger.create({ user:citizen._id, action:'deposit_waste', points:pts, type:'credit', reference:cp.name, description:`Deposited ${weightKg}kg of ${wasteType}`, balanceAfter:citizen.points });
    await sendSMS(citizen.phone, `TakaLoop: Habari! Umeweka ${weightKg}kg ya ${wasteType}. Umepata ${pts} pointi. Jumla: ${citizen.points} pointi. Asante!`);
    res.json({ success:true, pointsAwarded:pts, newBalance:citizen.points, carbonOffset, message:'Deposit recorded successfully' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.redeemPoints = async (req, res) => {
  try {
    const { type, amount, phone } = req.body;
    const RATES = { airtime: 1, cash: 0.8 };
    const user = await User.findById(req.user._id);
    const kesToPoints = type==='airtime' ? amount/RATES.airtime : amount/RATES.cash;
    if (user.points < kesToPoints) return res.status(400).json({ success:false, message:'Insufficient points' });
    user.points -= kesToPoints; await user.save();
    await PointsLedger.create({ user:user._id, action:`redeem_${type}`, points:kesToPoints, type:'debit', description:`Redeemed KES ${amount} ${type}`, balanceAfter:user.points });
    await sendSMS(phone||user.phone, `TakaLoop: Umebadilisha pointi ${kesToPoints} kwa KES ${amount} ${type}. Salio: ${user.points} pointi.`);
    res.json({ success:true, message:`KES ${amount} ${type} redemption initiated`, newBalance:user.points });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getMyPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('points totalWasteKg carbonCredits');
    const history = await PointsLedger.find({ user:req.user._id }).sort('-createdAt').limit(50);
    res.json({ success:true, points:user.points, totalWasteKg:user.totalWasteKg, carbonCredits:user.carbonCredits, history });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role:'citizen', points:{$gt:0} }).sort('-points').limit(20).select('name ward county points totalWasteKg');
    res.json({ success:true, leaderboard:users });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};
