const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, ward, county, businessName } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ success: false, message: 'Email or phone already registered' });
    const qrId = uuidv4();
    const qrCode = await QRCode.toDataURL(`TAKA-${qrId}`);
    const user = await User.create({ name, email, phone, password, role: role||'citizen', ward, county, businessName, qrCode });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: { _id:user._id, name:user.name, email:user.email, role:user.role, points:user.points, qrCode:user.qrCode } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { _id:user._id, name:user.name, email:user.email, role:user.role, points:user.points, phone:user.phone, ward:user.ward, county:user.county } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
};
