import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  refferalCode: {
    type: String,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  firstPurchaseRewardGiven: {
    type: Boolean,
    default: false,
  },
  firstPurchaseRewardAmount: {
      type: Number,
      default: 0,
  },
  password: {
    type: String,
    required: true,
  },
  purchasedCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      isExpired: {
        type: Boolean,
        default: false,
      },
    },
  ],
  acceptTerms: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
    currentSessionId: {
    type: String,
    default: null,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  sessionCreatedAt: {
    type: Date,
    default: null,
  },
  otpToken: String,
  otpTokenExpiry: Date,
  isBlocked: { 
    type: Boolean,
    default: false,
  },
});

// Pre-save middleware to update timestamps and session creation time
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If currentSessionId is being set, update sessionCreatedAt
  if (this.isModified('currentSessionId') && this.currentSessionId) {
    this.sessionCreatedAt = new Date();
  }
  
  // If currentSessionId is being cleared, also clear sessionCreatedAt
  if (this.isModified('currentSessionId') && !this.currentSessionId) {
    this.sessionCreatedAt = null;
  }
  
  next();
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
