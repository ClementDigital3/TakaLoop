const router = require('express').Router();
const c = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
router.post('/', protect, c.initiatePurchase);
router.post('/mpesa-callback', c.mpesaCallback);
router.put('/:id/confirm', protect, c.confirmDelivery);
router.put('/:id/dispute', protect, c.raiseDispute);
router.get('/my', protect, c.getMyTransactions);
module.exports = router;
