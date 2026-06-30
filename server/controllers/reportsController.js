const DumpReport = require('../models/DumpReport');
const PointsLedger = require('../models/PointsLedger');
const User = require('../models/User');

exports.createReport = async (req, res) => {
  try {
    const report = await DumpReport.create({
      ...req.body,
      reporter: req.user._id,
    });
    res.status(201).json({ success: true, message: 'Report submitted successfully', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, county, severity, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (county) query.county = county;
    if (severity) query.severity = severity;

    if (req.user.role === 'county_officer') {
      query.county = req.user.county;
    }

    const total = await DumpReport.countDocuments(query);
    const reports = await DumpReport.find(query)
      .populate('reporter', 'name phone ward')
      .populate('assignedOfficer', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await DumpReport.findById(req.params.id)
      .populate('reporter', 'name phone ward county')
      .populate('assignedOfficer', 'name phone');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, assignedOfficer, resolutionNotes } = req.body;
    const report = await DumpReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status;
    if (assignedOfficer) {
      report.assignedOfficer = assignedOfficer;
      report.assignedAt = new Date();
    }
    if (resolutionNotes) report.resolutionNotes = resolutionNotes;
    if (status === 'resolved') {
      report.resolvedAt = new Date();
      if (!report.pointsAwarded) {
        await PointsLedger.create({
          user: report.reporter,
          action: 'dump_report',
          points: 50,
          direction: 'credit',
          reference: report._id.toString(),
          description: 'Points awarded for verified dump report',
        });
        await User.findByIdAndUpdate(report.reporter, { $inc: { totalPoints: 50 } });
        report.pointsAwarded = true;
      }
    }
    report.updatedAt = new Date();
    await report.save();

    res.json({ success: true, message: 'Report updated', report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.upvoteReport = async (req, res) => {
  try {
    const report = await DumpReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const alreadyUpvoted = report.upvotes.includes(req.user._id);
    if (alreadyUpvoted) {
      report.upvotes = report.upvotes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      report.upvotes.push(req.user._id);
    }
    await report.save();
    res.json({ success: true, upvotes: report.upvotes.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await DumpReport.find({ reporter: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
