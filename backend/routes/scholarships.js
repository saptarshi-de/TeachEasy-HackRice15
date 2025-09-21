const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');

// Note: AI matching removed for project reorganization

const router = express.Router();

// Simple validation middleware
const validateScholarshipQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 })
];

// GET /api/scholarships - Get all scholarships with filtering and pagination
router.get('/', validateScholarshipQuery, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      minAmount,
      maxAmount,
      gradeLevels,
      subjects,
      fundingTypes,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    const andConditions = [];

    // Amount range filter
    if (minAmount || maxAmount) {
      const amountConditions = [];
      if (minAmount) {
        amountConditions.push({ 'amount.max': { $gte: parseFloat(minAmount) } });
      }
      if (maxAmount) {
        amountConditions.push({ 'amount.min': { $lte: parseFloat(maxAmount) } });
      }
      if (amountConditions.length > 0) {
        andConditions.push({ $or: amountConditions });
      }
    }

    // Array filters
    if (gradeLevels) {
      const gradeArray = gradeLevels.split(',').map(g => g.trim());
      filter['eligibility.gradeLevels'] = { $in: gradeArray };
    }
    if (subjects) {
      const subjectArray = subjects.split(',').map(s => s.trim());
      filter['eligibility.subjects'] = { $in: subjectArray };
    }
    if (fundingTypes) {
      const fundingArray = fundingTypes.split(',').map(f => f.trim());
      filter['eligibility.fundingTypes'] = { $in: fundingArray };
    }

    // Text search - search in title, organization, and description
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { organization: searchRegex },
          { description: searchRegex },
          { 'eligibility.subjects': searchRegex },
          { tags: searchRegex }
        ]
      });
    }

    // Apply and conditions if any
    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    let scholarships = await Scholarship.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    // Get total count for pagination
    const total = await Scholarship.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Note: AI matching removed for project reorganization

    res.json({
      scholarships,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ message: 'Error fetching scholarships', error: error.message });
  }
});

// GET /api/scholarships/:id - Get a specific scholarship
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    if (!scholarship.isActive) {
      return res.status(404).json({ message: 'Scholarship not available' });
    }

    // Increment view count
    await Scholarship.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    res.json(scholarship);
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({ message: 'Error fetching scholarship', error: error.message });
  }
});

// GET /api/scholarships/featured - Get featured/popular scholarships
router.get('/featured/limit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const featuredScholarships = await Scholarship.find({ 
      isActive: true, 
      isVerified: true 
    })
    .sort({ popularity: -1, viewCount: -1 })
    .limit(limit)
    .select('-__v');

    res.json(featuredScholarships);
  } catch (error) {
    console.error('Error fetching featured scholarships:', error);
    res.status(500).json({ message: 'Error fetching featured scholarships', error: error.message });
  }
});

// GET /api/scholarships/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const suggestions = await Scholarship.aggregate([
      {
        $match: {
          isActive: true,
          isVerified: true,
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { organization: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      },
      {
        $project: {
          title: 1,
          organization: 1,
          tags: 1
        }
      },
      {
        $limit: 10
      }
    ]);

    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ message: 'Error fetching search suggestions', error: error.message });
  }
});

// POST /api/scholarships/:id/bookmark - Bookmark a scholarship (placeholder for Auth0 integration)
router.post('/:id/bookmark', async (req, res) => {
  try {
    // TODO: Implement Auth0 authentication middleware
    // For now, this is a placeholder that will be implemented with Auth0
    
    const { auth0Id } = req.body; // This will come from Auth0 token in production
    
    if (!auth0Id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }

    // Find user and add bookmark
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already bookmarked
    if (user.bookmarkedScholarships.includes(req.params.id)) {
      return res.status(400).json({ message: 'Scholarship already bookmarked' });
    }

    // Add bookmark
    user.bookmarkedScholarships.push(req.params.id);
    await user.save();

    // Increment bookmark count
    await Scholarship.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: 1 } });

    res.json({ message: 'Scholarship bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking scholarship:', error);
    res.status(500).json({ message: 'Error bookmarking scholarship', error: error.message });
  }
});

// DELETE /api/scholarships/:id/bookmark - Remove bookmark
router.delete('/:id/bookmark', async (req, res) => {
  try {
    const { auth0Id } = req.body;
    
    if (!auth0Id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove bookmark
    user.bookmarkedScholarships = user.bookmarkedScholarships.filter(
      id => id.toString() !== req.params.id
    );
    await user.save();

    // Decrement bookmark count
    await Scholarship.findByIdAndUpdate(req.params.id, { $inc: { bookmarkCount: -1 } });

    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Error removing bookmark', error: error.message });
  }
});

module.exports = router;
