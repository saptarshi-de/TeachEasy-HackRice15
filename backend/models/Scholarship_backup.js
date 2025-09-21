const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  // Basic information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  organization: {
    type: String,
    required: true,
    trim: true
  },
  
  website: {
    type: String,
    default: null
  },
  
  // Funding details
  amount: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'CAD', 'EUR', 'GBP']
    }
  },
  
  // Eligibility criteria
  eligibility: {
    gradeLevels: [{
      type: String,
      enum: ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult Education']
    }],
    
    subjects: [{
      type: String,
      enum: [
        'Mathematics', 'Science', 'English/Language Arts', 'Social Studies', 'History',
        'Art', 'Music', 'Physical Education', 'Foreign Language', 'Computer Science',
        'Special Education', 'ESL/ELL', 'Reading', 'Writing', 'Any', 'Other'
      ]
    }],
    
    regions: [{
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest', 'National', 'International', 'Rural Areas', 'Local Communities']
    }],
    
    districts: [{
      type: String,
      enum: [
        // Houston Area
        'Houston ISD', 'Katy ISD', 'Cypress-Fairbanks ISD', 'Spring ISD', 'Klein ISD', 'Aldine ISD',
        'Fort Bend ISD', 'Alief ISD', 'Pasadena ISD', 'Clear Creek ISD', 'Pearland ISD',
        // Dallas Area
        'Dallas ISD', 'Plano ISD', 'Richardson ISD', 'Garland ISD', 'Mesquite ISD', 'Irving ISD',
        'Frisco ISD', 'McKinney ISD', 'Allen ISD', 'Lewisville ISD',
        // Austin Area
        'Austin ISD', 'Round Rock ISD', 'Leander ISD', 'Pflugerville ISD', 'Lake Travis ISD',
        // San Antonio Area
        'San Antonio ISD', 'Northside ISD', 'North East ISD', 'Judson ISD', 'East Central ISD',
        // Other Major Districts
        'Fort Worth ISD', 'Arlington ISD', 'El Paso ISD', 'Corpus Christi ISD', 'Lubbock ISD',
        'Amarillo ISD', 'Laredo ISD', 'Brownsville ISD', 'McAllen ISD', 'Waco ISD',
        'Killeen ISD', 'Tyler ISD', 'Beaumont ISD', 'Bryan ISD', 'College Station ISD',
        // Statewide/National
        'Statewide', 'National', 'International', 'Rural Districts', 'High-Need Districts', 'Local Districts', 'Texas Districts', 'California Districts', 'New York Districts'
      ]
    }],
    
    fundingTypes: [{
      type: String,
      enum: [
        'Classroom Supplies', 'Technology Equipment', 'Books and Materials',
        'Professional Development', 'Field Trips', 'Special Programs',
        'Student Support', 'Classroom Furniture', 'STEM Materials', 'General', 'Other'
      ]
    }],
    
    requirements: {
      type: String,
      default: ''
    }
  },
  
  // Application details
  application: {
    deadline: {
      type: Date,
      required: true
    },
    
    applicationUrl: {
      type: String,
      default: null
    },
    
    applicationMethod: {
      type: String,
      enum: ['Online', 'Email', 'Mail', 'Phone', 'In-Person'],
      default: 'Online'
    },
    
    documentsRequired: [{
      type: String,
      enum: [
        'Resume/CV', 'Cover Letter', 'Essay', 'Recommendation Letters', 'Budget Proposal', 'School Information', 'Other',
        'Partnership Agreement', 'Program Plan', 'Program Description', 'Evaluation Plan', 'Rural Designation', 'Needs Assessment',
        'Project Proposal', 'Budget', 'Letters of Recommendation', 'Equity Plan', 'Community Impact Statement',
        'STEM Project Plan', 'Student Impact Statement', 'Research Proposal', 'Literature Review',
        'Technology Integration Plan', 'School Support Letter', 'Google Tools Implementation Plan',
        'STEM Project Proposal', 'Diversity Statement', 'Community Impact Plan', 'Local Support Letters',
        'Digital Divide Assessment', 'Technology Plan', 'Professional Development Plan', 'Principal Recommendation',
        'STEM Curriculum Plan', 'Innovation Proposal', 'Arts Integration Plan', 'Student Work Samples',
        'STEM Program Plan', 'Student Outcomes', 'Student Impact Plan'
      ]
    }],
    
    isRecurring: {
      type: Boolean,
      default: false
    },
    
    nextDeadline: {
      type: Date,
      default: null
    }
  },
  
  // Contact information
  contact: {
    email: {
      type: String,
      default: null
    },
    
    phone: {
      type: String,
      default: null
    },
    
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  popularity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  viewCount: {
    type: Number,
    default: 0
  },
  
  bookmarkCount: {
    type: Number,
    default: 0
  },
  
  // AI Matching fields
  status: {
    type: String,
    default: 'Open'
  },
  
  source: {
    type: String,
    default: 'Unknown'
  },
  
  matchLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Very Low'],
    default: 'Medium'
  },
  
  matchScore: {
    type: Number,
    default: 0.5
  },
  
  overallScore: {
    type: Number,
    default: 0.5
  },
  
  semanticScore: {
    type: Number,
    default: 0.5
  },
  
  successPrediction: {
    type: Number,
    default: 0.5
  },
  
  daysUntilDeadline: {
    type: Number,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  publishedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
scholarshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
scholarshipSchema.index({ title: 'text', description: 'text', organization: 'text' });
scholarshipSchema.index({ 'amount.min': 1, 'amount.max': 1 });
scholarshipSchema.index({ 'application.deadline': 1 });
scholarshipSchema.index({ 'eligibility.regions': 1 });
scholarshipSchema.index({ 'eligibility.gradeLevels': 1 });
scholarshipSchema.index({ 'eligibility.subjects': 1 });
scholarshipSchema.index({ 'eligibility.fundingTypes': 1 });
scholarshipSchema.index({ isActive: 1, isVerified: 1 });
scholarshipSchema.index({ popularity: -1 });
scholarshipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
