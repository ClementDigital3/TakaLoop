const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['citizen', 'collector', 'business', 'recycler', 'county_officer', 'admin'],
    default: 'citizen'
  },
  isVerified: { type: Boolean, default: false },
  verificationBadge: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  qrCode: { type: String, default: '' },
  ward: { type: String, default: '' },
  county: { type: String, default: '' },
  businessName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  idNumber: { type: String, default: '' },
  points: { type: Number, default: 0 },
  totalWasteKg: { type: Number, default: 0 },
  carbonCredits: { type: Number, default: 0 },
  mpesaNumber: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
