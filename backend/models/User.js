const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Auth0 user ID
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Basic profile information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  // School and teaching information
  schoolName: {
    type: String,
    required: true
  },
  
  schoolRegion: {
    type: String,
    required: true,
    enum: ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest']
  },
  
  gradeLevel: {
    type: [String],
    required: true,
    enum: ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult Education']
  },
  
  subjects: {
    type: [String],
    required: true,
    enum: [
      'Mathematics', 'Science', 'English/Language Arts', 'Social Studies', 'History',
      'Art', 'Music', 'Physical Education', 'Foreign Language', 'Computer Science',
      'Special Education', 'ESL/ELL', 'Reading', 'Writing', 'Other'
    ]
  },
  
  // Funding needs
  fundingNeeds: {
    type: [String],
    required: true,
    enum: [
      'Classroom Supplies', 'Technology Equipment', 'Books and Materials',
      'Professional Development', 'Field Trips', 'Special Programs',
      'Student Support', 'Classroom Furniture', 'STEM Materials', 'Other'
    ]
  },
  
  // Optional CV/Resume
  resumeUrl: {
    type: String,
    default: null
  },
  
  // User preferences
  preferences: {
    maxAmount: {
      type: Number,
      default: 10000
    },
    minAmount: {
      type: Number,
      default: 0
    },
    preferredDeadline: {
      type: Date,
      default: null
    }
  },
  
  // Bookmarked scholarships
  bookmarkedScholarships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  }],
  
  // View history
  viewHistory: [{
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
userSchema.index({ auth0Id: 1 });
userSchema.index({ email: 1 });
userSchema.index({ schoolRegion: 1 });
userSchema.index({ gradeLevel: 1 });
userSchema.index({ subjects: 1 });

module.exports = mongoose.model('User', userSchema);
