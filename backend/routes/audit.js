const express = require('express');
const router = express.Router();
const axios = require('axios');
const AuditReport = require('../models/AuditReport');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @POST /api/audit — run AI waste audit
router.post('/', protect, authorize('business', 'recycler', 'admin'), async (req, res) => {
  try {
    const { operationsDescription, industryType, wasteVolume, currentDisposalMethods } = req.body;

    // Create pending audit record
    const audit = await AuditReport.create({
      business: req.user._id,
      businessName: req.user.businessName || req.user.name,
      industryType,
      operationsDescription,
      wasteVolume,
      currentDisposalMethods,
      status: 'processing',
    });

    // Call Claude API
    const prompt = `You are WasteIQ, an expert waste management auditor for Kenyan businesses. 
    
Analyze this business's waste profile and provide a comprehensive audit report.

Business: ${req.user.businessName || req.user.name}
Industry: ${industryType}
Operations: ${operationsDescription}
Monthly Waste Volume: ${wasteVolume}
Current Disposal Methods: ${currentDisposalMethods}

Return ONLY a valid JSON object with this exact structure:
{
  "wasteProfile": [
    {"category": "plastics", "estimatedKg": 500, "percentage": 40}
  ],
  "recoverableWaste": [
    {"material": "PET Plastic", "estimatedKg": 300, "potentialValue": 9000}
  ],
  "recommendations": [
    {"action": "Partner with Taka Taka Solutions for plastic pickup", "priority": "high", "estimatedSaving": "KES 15,000/month"}
  ],
  "certifiedHandlers": [
    {"name": "Taka Taka Solutions", "location": "Nairobi", "contact": "0700000000", "wasteTypes": ["plastics", "organics"]}
  ],
  "carbonFootprint": {
    "current": 2500,
    "potential": 800,
    "unit": "kg CO2/month"
  },
  "complianceScore": 42,
  "summary": "Your business generates significant recoverable waste. With proper segregation and certified handler partnerships, you could recover KES 25,000/month and reduce your carbon footprint by 68%."
}`;

    const claudeRes = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    const rawText = claudeRes.data.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!aiAnalysis) throw new Error('Failed to parse AI response');

    // Calculate carbon credits (1 tonne CO2 saved = 1 credit)
    const co2Saved = (aiAnalysis.carbonFootprint.current - aiAnalysis.carbonFootprint.potential) / 1000;
    const carbonCreditsEarned = Math.round(co2Saved * 12); // annualized

    audit.aiAnalysis = aiAnalysis;
    audit.carbonCreditsEarned = carbonCreditsEarned;
    audit.status = 'completed';
    audit.tokensUsed = claudeRes.data.usage?.output_tokens || 0;
    await audit.save();

    // Update user carbon credits
    await User.findByIdAndUpdate(req.user._id, { $inc: { carbonCredits: carbonCreditsEarned } });

    res.json({ success: true, data: audit });
  } catch (err) {
    console.error('WasteIQ error:', err.message);
    await AuditReport.findOneAndUpdate(
      { business: req.user._id, status: 'processing' },
      { status: 'failed' }
    );
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/audit/my — user's audits
router.get('/my', protect, async (req, res) => {
  try {
    const audits = await AuditReport.find({ business: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: audits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/audit/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const audit = await AuditReport.findById(req.params.id).populate('business', 'name businessName');
    if (!audit) return res.status(404).json({ success: false, message: 'Audit not found' });
    res.json({ success: true, data: audit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
