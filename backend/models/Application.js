const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  scholarshipTitle: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  amount: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    display: {
      type: String,
      required: true
    }
  },
  applicationUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Under Review', 'Approved', 'Rejected', 'Pending Documents', 'Submitted'],
    default: 'Under Review'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ userId: 1, appliedAt: -1 });
applicationSchema.index({ scholarshipId: 1, userId: 1 }, { unique: true });

// Virtual for days until deadline
applicationSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for deadline status
applicationSchema.virtual('deadlineStatus').get(function() {
  const daysLeft = this.daysUntilDeadline;
  if (daysLeft < 0) return 'Expired';
  if (daysLeft === 0) return 'Due Today';
  if (daysLeft <= 7) return 'Due Soon';
  return 'Active';
});

// Static method to get user applications
applicationSchema.statics.getUserApplications = function(userId, status = null) {
  const query = { userId, isActive: true };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('scholarshipId', 'title organization amount application')
    .sort({ appliedAt: -1 });
};

// Static method to check if user has applied to scholarship
applicationSchema.statics.hasUserApplied = function(userId, scholarshipId) {
  return this.findOne({ userId, scholarshipId, isActive: true });
};

module.exports = mongoose.model('Application', applicationSchema);
