const express = require('express');
const router = express.Router();
const DumpReport = require('../models/DumpReport');
const User = require('../models/User');
const PointsLedger = require('../models/PointsLedger');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/reports — all reports (with filters)
router.get('/', async (req, res) => {
  try {
    const { county, status, severity, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (county) filter.county = new RegExp(county, 'i');
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      DumpReport.find(filter).populate('reporter', 'name ward').populate('assignedOfficer', 'name').sort('-createdAt').skip(skip).limit(Number(limit)),
      DumpReport.countDocuments(filter)
    ]);
    res.json({ success: true, data: reports, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/map — all reports with coordinates (for map)
router.get('/map', async (req, res) => {
  try {
    const { county } = req.query;
    const filter = { isValid: true };
    if (county) filter.county = new RegExp(county, 'i');
    const reports = await DumpReport.find(filter).select('coordinates county ward severity status title createdAt').limit(500);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/reports — citizen files a report
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, photos, coordinates, address, county, ward, wasteTypes, severity, estimatedVolume } = req.body;
    const report = await DumpReport.create({
      reporter: req.user._id,
      title, description, photos, coordinates, address, county, ward, wasteTypes, severity, estimatedVolume
    });
    res.status(201).json({ success: true, data: report, message: 'Report submitted. You will earn 50 TakaPoints once verified.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/reports/:id
router.get('/:id', async (req, res) => {
  try {
    const report = await DumpReport.findById(req.params.id).populate('reporter', 'name ward').populate('assignedOfficer', 'name phone');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/reports/:id/status — county officer updates status
router.patch('/:id/status', protect, authorize('county_officer', 'admin'), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await DumpReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status;
    if (status === 'assigned') {
      report.assignedOfficer = req.user._id;
      report.assignedAt = new Date();
    }
    if (status === 'resolved') {
      report.resolvedAt = new Date();
      report.resolutionNotes = resolutionNotes;

      // Award points to reporter
      if (!report.pointsAwarded) {
        const pointsEarned = 50;
        const reporter = await User.findById(report.reporter);
        const balanceBefore = reporter.points;
        reporter.points += pointsEarned;
        await reporter.save();
        await PointsLedger.create({
          user: reporter._id,
          action: 'dump_report',
          points: pointsEarned,
          reference: report._id.toString(),
          description: `Dump report verified and resolved`,
          balanceBefore,
          balanceAfter: reporter.points,
        });
        report.pointsAwarded = true;
        report.pointsAmount = pointsEarned;
      }
    }
    await report.save();
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/reports/:id/upvote — community verification
router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const report = await DumpReport.findById(req.params.id);
    const alreadyUpvoted = report.upvotes.includes(req.user._id);
    if (alreadyUpvoted) {
      report.upvotes = report.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      report.upvotes.push(req.user._id);
    }
    await report.save();
    res.json({ success: true, upvotes: report.upvotes.length, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
