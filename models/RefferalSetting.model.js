const mongoose = require('mongoose');

const ReferralSettingsSchema = new mongoose.Schema({
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 20, // Default 20% discount
  },
  cashbackAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 20, // Default ₹20 cashback
  },
  maxReferrals: {
    type: Number,
    required: true,
    min: 0,
    default: 0, // 0 means unlimited referrals
  },
  rewardCreditDays: {
    type: Number,
    required: true,
    min: 0,
    default: 2, // Default 48 hours (2 days)
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ReferralSettings = mongoose.models.ReferralSettings || mongoose.model('ReferralSettings', ReferralSettingsSchema);

export default ReferralSettings;