const AuditReport = require('../models/AuditReport');
const User = require('../models/User');
const axios = require('axios');

exports.createAudit = async (req, res) => {
  try {
    const { businessDescription, wasteLogInput } = req.body;
    const audit = await AuditReport.create({ business:req.user._id, businessDescription, wasteLogInput, aiAnalysis:'Processing...', status:'processing' });
    res.status(202).json({ success:true, auditId:audit._id, message:'Audit initiated. Processing with AI...' });
    // Process async
    processAudit(audit._id, businessDescription, wasteLogInput, req.user._id).catch(console.error);
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

const processAudit = async (auditId, desc, wasteLog, userId) => {
  try {
    const prompt = `You are TakaLoop's waste intelligence AI. Analyze this Kenyan business and provide a comprehensive waste audit.

Business Description: ${desc}
Waste Log: ${wasteLog || 'Not provided'}

Provide a JSON response with these exact keys:
{
  "wasteProfile": { "category": "percentage" },
  "recoveryOpportunities": ["opportunity 1", "opportunity 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "certifiedHandlers": [{"name":"handler name","contact":"0700000000","wasteTypes":["plastics"]}],
  "estimatedSavingsKes": 50000,
  "carbonCreditsPotential": 2.5,
  "summary": "Brief audit summary"
}
Return ONLY valid JSON, no markdown.`;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role:'user', content: prompt }]
    }, {
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }
    });

    const text = response.data.content[0].text;
    let parsed = {};
    try { parsed = JSON.parse(text.replace(/```json|```/g,'').trim()); } catch(e) { parsed = { summary: text }; }
    
    await AuditReport.findByIdAndUpdate(auditId, {
      aiAnalysis: parsed.summary || text,
      wasteProfile: parsed.wasteProfile || {},
      recoveryOpportunities: parsed.recoveryOpportunities || [],
      recommendations: parsed.recommendations || [],
      certifiedHandlers: parsed.certifiedHandlers || [],
      estimatedSavingsKes: parsed.estimatedSavingsKes || 0,
      carbonCreditsPotential: parsed.carbonCreditsPotential || 0,
      status: 'completed'
    });

    const user = await User.findById(userId);
    if (user && parsed.carbonCreditsPotential) { user.carbonCredits += parsed.carbonCreditsPotential; await user.save(); }
  } catch(e) {
    console.error('Audit AI error:', e.message);
    await AuditReport.findByIdAndUpdate(auditId, { status:'failed', aiAnalysis:'AI processing failed. Please try again.' });
  }
};

exports.getAudit = async (req, res) => {
  try {
    const audit = await AuditReport.findById(req.params.id).populate('business','name businessName');
    if (!audit) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, audit });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};

exports.getMyAudits = async (req, res) => {
  try {
    const audits = await AuditReport.find({ business:req.user._id }).sort('-createdAt');
    res.json({ success:true, audits });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
};
