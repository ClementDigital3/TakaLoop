const DumpReport = require('../models/DumpReport');
const Notification = require('../models/Notification');
const { awardPoints } = require('./pointsController');
const { sendSMS } = require('../utils/sms');

exports.createReport = async (req, res) => {
  try {
    const report = await DumpReport.create({ ...req.body, reporter:req.user._id });
    res.status(201).json({ success:true, report, message:'Report submitted. You will earn 50 points when verified.' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getReports = async (req, res) => {
  try {
    const { status, county, severity, page=1, limit=20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (county) query['location.county'] = county;
    if (severity) query.severity = severity;
    if (req.user?.role === 'officer') query['location.ward'] = req.user.ward;
    const reports = await DumpReport.find(query).populate('reporter','name phone ward').populate('assignedOfficer','name phone').sort('-createdAt').skip((page-1)*limit).limit(+limit);
    const total = await DumpReport.countDocuments(query);
    res.json({ success:true, count:reports.length, total, reports });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { status, officerId } = req.body;
    const report = await DumpReport.findById(req.params.id).populate('reporter','name phone points');
    if (!report) return res.status(404).json({ success:false, message:'Not found' });
    report.status = status;
    if (status==='assigned' && officerId) { report.assignedOfficer=officerId; report.assignedAt=new Date(); }
    if (status==='resolved') {
      report.resolvedAt = new Date();
      if (!report.pointsReleased) {
        await awardPoints(report.reporter._id,'dump_report',report._id.toString(),'Dump report resolved');
        report.pointsReleased = true;
        await sendSMS(report.reporter.phone, `TakaLoop: Your dump report at ${report.location.address} has been resolved! You earned 50 points.`);
      }
    }
    await report.save();
    await Notification.create({ user:report.reporter._id, title:`Report ${status}`, message:`Your dump report at ${report.location.address} is now ${status}`, type:'report' });
    res.json({ success:true, report });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.upvoteReport = async (req, res) => {
  try {
    const report = await DumpReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success:false, message:'Not found' });
    const idx = report.upvotes.indexOf(req.user._id);
    if (idx>-1) report.upvotes.splice(idx,1); else report.upvotes.push(req.user._id);
    await report.save();
    res.json({ success:true, upvotes:report.upvotes.length });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};
