const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Technology',
      'Travel',
      'Shopping',
      'Entertainment',
      'Health & Wellness',
      'Education',
      'Books & Media',
      'Food & Dining',
      'Insurance',
      'Financial Services',
      'Other'
    ],
    required: true
  },
  discountType: {
    type: String,
    enum: [
      'Percentage',
      'Fixed Amount',
      'Free Shipping',
      'Buy One Get One',
      'Special Offer',
      'Membership Benefit'
    ],
    required: true
  },
  discountValue: {
    type: String, // e.g., "10%", "$5 off", "Free shipping"
    required: true
  },
  originalPrice: {
    type: String,
    trim: true
  },
  discountedPrice: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  promoCode: {
    type: String,
    trim: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  requirements: {
    teacherId: {
      type: Boolean,
      default: false
    },
    membership: {
      type: String,
      enum: ['NEA', 'AFT', 'Any', 'None'],
      default: 'None'
    },
    minimumSpend: {
      type: String,
      trim: true
    },
    other: {
      type: String,
      trim: true
    }
  },
  source: {
    type: String,
    enum: [
      'NEA Perks',
      'Retailer Website',
      'Corporate Partnership',
      'Educational Institution',
      'Other'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Coming Soon'],
    default: 'Active'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  nextCycleDate: {
    type: Date
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
discountSchema.index({ category: 1, status: 1 });
discountSchema.index({ company: 1 });
discountSchema.index({ validUntil: 1 });
discountSchema.index({ featured: 1, status: 1 });
discountSchema.index({ createdAt: -1 });

// Virtual for days until expiration
discountSchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const expiration = new Date(this.validUntil);
  const diffTime = expiration - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for isExpiringSoon
discountSchema.virtual('isExpiringSoon').get(function() {
  return this.daysUntilExpiration <= 7 && this.daysUntilExpiration > 0;
});

// Pre-save middleware to update timestamps
discountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get active discounts
discountSchema.statics.getActiveDiscounts = function() {
  const now = new Date();
  return this.find({
    status: 'Active',
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });
};

// Static method to get featured discounts
discountSchema.statics.getFeaturedDiscounts = function(limit = 6) {
  const now = new Date();
  return this.find({
    featured: true,
    status: 'Active',
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  }).limit(limit);
};

module.exports = mongoose.model('Discount', discountSchema);
