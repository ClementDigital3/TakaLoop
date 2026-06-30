const express = require('express');
const router = express.Router();
const { initiateSTKPush, mpesaCallback, confirmDelivery } = require('../controllers/mpesaController');
const { protect } = require('../middleware/auth');
router.post('/stk-push', protect, initiateSTKPush);
router.post('/callback', mpesaCallback);
router.post('/confirm-delivery/:transactionId', protect, confirmDelivery);
module.exports = router;
