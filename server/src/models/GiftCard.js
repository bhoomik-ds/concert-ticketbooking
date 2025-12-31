const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "SUMMER2025"
  discountType: { type: String, enum: ['flat', 'percent'], required: true }, // "flat" (₹500 off) or "percent" (10% off)
  value: { type: Number, required: true }, // 500 or 10
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('GiftCard', giftCardSchema);