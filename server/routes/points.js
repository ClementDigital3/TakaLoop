const router = require('express').Router();
const c = require('../controllers/pointsController');
const { protect, authorize } = require('../middleware/auth');
router.post('/deposit', protect, authorize('officer','admin'), c.recordDeposit);
router.post('/redeem', protect, c.redeemPoints);
router.get('/my', protect, c.getMyPoints);
router.get('/leaderboard', c.getLeaderboard);
module.exports = router;
