const router = require('express').Router();
const c = require('../controllers/collectionPointController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', c.getCollectionPoints);
router.post('/', protect, authorize('admin', 'officer'), c.createCollectionPoint);
router.put('/:id', protect, authorize('admin','officer'), c.updateCollectionPoint);
module.exports = router;
