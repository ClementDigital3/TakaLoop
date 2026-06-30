const router = require('express').Router();
const c = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');
router.post('/', protect, authorize('business','recycler','admin'), c.createAudit);
router.get('/my', protect, c.getMyAudits);
router.get('/:id', protect, c.getAudit);
module.exports = router;
