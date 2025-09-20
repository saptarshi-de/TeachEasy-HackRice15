const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validation middleware for user profile
const validateUserProfile = [
  body('schoolName').notEmpty().withMessage('School name is required'),
  body('schoolRegion').isIn(['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest']).withMessage('Invalid school region'),
  body('gradeLevel').isArray({ min: 1 }).withMessage('At least one grade level is required'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('fundingNeeds').isArray({ min: 1 }).withMessage('At least one funding need is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').notEmpty().withMessage('Name is required')
];

// GET /api/users/profile/:auth0Id - Get user profile
router.get('/profile/:auth0Id', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// POST /api/users/profile - Create or update user profile
router.post('/profile', validateUserProfile, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      auth0Id,
      email,
      name,
      schoolName,
      schoolRegion,
      gradeLevel,
      subjects,
      fundingNeeds,
      resumeUrl,
      preferences
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ auth0Id });
    
    if (user) {
      // Update existing user
      user.email = email;
      user.name = name;
      user.schoolName = schoolName;
      user.schoolRegion = schoolRegion;
      user.gradeLevel = gradeLevel;
      user.subjects = subjects;
      user.fundingNeeds = fundingNeeds;
      user.resumeUrl = resumeUrl || user.resumeUrl;
      user.preferences = { ...user.preferences, ...preferences };
      user.updatedAt = new Date();
      
      await user.save();
      res.json({ message: 'Profile updated successfully', user });
    } else {
      // Create new user
      user = new User({
        auth0Id,
        email,
        name,
        schoolName,
        schoolRegion,
        gradeLevel,
        subjects,
        fundingNeeds,
        resumeUrl,
        preferences: preferences || {}
      });
      
      await user.save();
      res.status(201).json({ message: 'Profile created successfully', user });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    res.status(500).json({ message: 'Error creating/updating profile', error: error.message });
  }
});

// GET /api/users/:auth0Id/bookmarks - Get user's bookmarked scholarships
router.get('/:auth0Id/bookmarks', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id })
      .populate('bookmarkedScholarships', '-__v');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.bookmarkedScholarships);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
  }
});

// GET /api/users/:auth0Id/history - Get user's view history
router.get('/:auth0Id/history', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id })
      .populate({
        path: 'viewHistory.scholarshipId',
        select: '-__v'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort by most recent first
    const sortedHistory = user.viewHistory.sort((a, b) => b.viewedAt - a.viewedAt);
    
    res.json(sortedHistory);
  } catch (error) {
    console.error('Error fetching view history:', error);
    res.status(500).json({ message: 'Error fetching view history', error: error.message });
  }
});

// POST /api/users/:auth0Id/history - Add to view history
router.post('/:auth0Id/history', async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    
    if (!scholarshipId) {
      return res.status(400).json({ message: 'Scholarship ID is required' });
    }

    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in history
    const existingEntry = user.viewHistory.find(
      entry => entry.scholarshipId.toString() === scholarshipId
    );

    if (existingEntry) {
      // Update timestamp
      existingEntry.viewedAt = new Date();
    } else {
      // Add new entry
      user.viewHistory.push({
        scholarshipId,
        viewedAt: new Date()
      });
    }

    // Keep only last 50 entries
    if (user.viewHistory.length > 50) {
      user.viewHistory = user.viewHistory
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .slice(0, 50);
    }

    await user.save();
    res.json({ message: 'View history updated successfully' });
  } catch (error) {
    console.error('Error updating view history:', error);
    res.status(500).json({ message: 'Error updating view history', error: error.message });
  }
});

// GET /api/users/:auth0Id/recommendations - Get personalized recommendations
router.get('/:auth0Id/recommendations', async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.params.auth0Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { limit = 10 } = req.query;

    // Build recommendation query based on user profile
    const recommendationQuery = {
      isActive: true,
      isVerified: true,
      $and: [
        {
          $or: [
            { 'eligibility.gradeLevels': { $in: user.gradeLevel } },
            { 'eligibility.gradeLevels': { $in: ['Any'] } }
          ]
        },
        {
          $or: [
            { 'eligibility.subjects': { $in: user.subjects } },
            { 'eligibility.subjects': { $in: ['Any'] } }
          ]
        },
        {
          $or: [
            { 'eligibility.regions': { $in: [user.schoolRegion] } },
            { 'eligibility.regions': { $in: ['National', 'International'] } }
          ]
        },
        {
          $or: [
            { 'eligibility.fundingTypes': { $in: user.fundingNeeds } },
            { 'eligibility.fundingTypes': { $in: ['General'] } }
          ]
        }
      ]
    };

    // Add amount range filter if user has preferences
    if (user.preferences.minAmount || user.preferences.maxAmount) {
      recommendationQuery.$and.push({
        $or: [
          { 'amount.min': { $lte: user.preferences.maxAmount || 100000 } },
          { 'amount.max': { $gte: user.preferences.minAmount || 0 } }
        ]
      });
    }

    const recommendations = await User.aggregate([
      { $match: { auth0Id: req.params.auth0Id } },
      {
        $lookup: {
          from: 'scholarships',
          let: { 
            userGradeLevel: '$gradeLevel',
            userSubjects: '$subjects',
            userRegion: '$schoolRegion',
            userFundingNeeds: '$fundingNeeds'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$isVerified', true] },
                    {
                      $or: [
                        { $in: ['$eligibility.gradeLevels', '$$userGradeLevel'] },
                        { $in: ['Any', '$eligibility.gradeLevels'] }
                      ]
                    },
                    {
                      $or: [
                        { $in: ['$eligibility.subjects', '$$userSubjects'] },
                        { $in: ['Any', '$eligibility.subjects'] }
                      ]
                    },
                    {
                      $or: [
                        { $in: ['$eligibility.regions', '$$userRegion'] },
                        { $in: ['National', '$eligibility.regions'] },
                        { $in: ['International', '$eligibility.regions'] }
                      ]
                    },
                    {
                      $or: [
                        { $in: ['$eligibility.fundingTypes', '$$userFundingNeeds'] },
                        { $in: ['General', '$eligibility.fundingTypes'] }
                      ]
                    }
                  ]
                }
              }
            },
            { $sort: { popularity: -1, viewCount: -1 } },
            { $limit: parseInt(limit) }
          ],
          as: 'recommendations'
        }
      },
      { $unwind: '$recommendations' },
      { $replaceRoot: { newRoot: '$recommendations' } }
    ]);

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
});

module.exports = router;
