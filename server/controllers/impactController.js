const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const Transaction = require('../models/Transaction');
const DumpReport = require('../models/DumpReport');
const WasteDeposit = require('../models/WasteDeposit');

exports.getImpact = async (req,res) => {
  try {
    const [totalUsers,totalListings,totalTransactions,totalReports,totalDeposits,completedTx] = await Promise.all([
      User.countDocuments(),
      WasteListing.countDocuments(),
      Transaction.countDocuments({paymentStatus:'completed'}),
      DumpReport.countDocuments(),
      WasteDeposit.aggregate([{$group:{_id:null,totalKg:{$sum:'$weightKg'},totalCO2:{$sum:'$carbonOffset'}}}]),
      Transaction.aggregate([{$match:{paymentStatus:'completed'}},{$group:{_id:null,total:{$sum:'$amount'}}}])
    ]);
    const wasteKg = totalDeposits[0]?.totalKg || 0;
    const co2Saved = totalDeposits[0]?.totalCO2 || 0;
    const moneyCirculated = completedTx[0]?.total || 0;
    const resolvedReports = await DumpReport.countDocuments({status:'resolved'});
    const byCategory = await WasteDeposit.aggregate([{$group:{_id:'$wasteType',totalKg:{$sum:'$weightKg'}}},{$sort:{totalKg:-1}}]);
    const byCounty = await DumpReport.aggregate([{$group:{_id:'$location.county',count:{$sum:1}}},{$sort:{count:-1}},{$limit:10}]);
    res.json({
      success:true,
      stats:{ totalUsers, totalListings, totalTransactions, totalReports, resolvedReports, wasteKg:+wasteKg.toFixed(2), co2SavedKg:+co2Saved.toFixed(2), moneyCirculatedKes:+moneyCirculated.toFixed(2), treesEquivalent:+(co2Saved/21).toFixed(0) },
      byCategory, byCounty
    });
  } catch(e){res.status(500).json({success:false,message:e.message});}
};
