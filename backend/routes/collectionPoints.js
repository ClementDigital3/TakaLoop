const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const CollectionPoint = require('../models/CollectionPoint');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/collection-points
router.get('/', async (req, res) => {
  try {
    const { county, active } = req.query;
    const filter = {};
    if (county) filter.county = new RegExp(county, 'i');
    if (active !== undefined) filter.isActive = active === 'true';
    const points = await CollectionPoint.find(filter).populate('operator', 'name phone');
    res.json({ success: true, data: points });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/collection-points — admin creates a collection point
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const qrCodeId = uuidv4().slice(0, 8).toUpperCase();
    const qrCode = await QRCode.toDataURL(`TAKALOOP:CP:${qrCodeId}`);
    const point = await CollectionPoint.create({ ...req.body, qrCodeId, qrCode, operator: req.user._id });
    res.status(201).json({ success: true, data: point });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/collection-points/:id
router.get('/:id', async (req, res) => {
  try {
    const point = await CollectionPoint.findById(req.params.id).populate('operator', 'name phone');
    if (!point) return res.status(404).json({ success: false, message: 'Collection point not found' });
    res.json({ success: true, data: point });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/collection-points/:id
router.put('/:id', protect, authorize('admin', 'county_officer'), async (req, res) => {
  try {
    const point = await CollectionPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: point });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
