const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', protect, c.getReports);
router.post('/', protect, c.createReport);
router.put('/:id/status', protect, authorize('officer','admin'), c.updateReportStatus);
router.post('/:id/upvote', protect, c.upvoteReport);
module.exports = router;
