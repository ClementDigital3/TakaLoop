const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['citizen', 'collector', 'business', 'recycler', 'officer', 'admin'], default: 'citizen' },
  avatar: { type: String, default: '' },
  ward: { type: String, default: '' },
  county: { type: String, default: 'Nairobi' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  qrCode: { type: String, unique: true, sparse: true },
  points: { type: Number, default: 0 },
  totalWasteKg: { type: Number, default: 0 },
  carbonCredits: { type: Number, default: 0 },
  businessName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  idNumber: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [36.8219, -1.2921] }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
