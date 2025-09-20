const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');

// AI Matcher is optional (Python module)
let AIMatcher = null;
try {
  AIMatcher = require('../scrapers/ai_matcher');
} catch (error) {
  console.log('AI Matcher not available (Python module)');
}

// Use simple JavaScript matcher as fallback
const SimpleMatcher = require('../utils/simpleMatcher');

const router = express.Router();

// Validation middleware
const validateScholarshipQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Min amount must be a positive number'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Max amount must be a positive number'),
  query('regions').optional().isString().withMessage('Regions must be a string'),
  query('gradeLevels').optional().isString().withMessage('Grade levels must be a string'),
  query('subjects').optional().isString().withMessage('Subjects must be a string'),
  query('fundingTypes').optional().isString().withMessage('Funding types must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sortBy').optional().isIn(['deadline', 'amount', 'popularity', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
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
      regions,
      gradeLevels,
      subjects,
      fundingTypes,
      search,
      sortBy = 'deadline',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true, isVerified: true };

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.$or = [];
      if (minAmount) {
        filter.$or.push({ 'amount.max': { $gte: parseFloat(minAmount) } });
      }
      if (maxAmount) {
        filter.$or.push({ 'amount.min': { $lte: parseFloat(maxAmount) } });
      }
    }

    // Region filter
    if (regions) {
      const regionArray = regions.split(',').map(r => r.trim());
      filter['eligibility.regions'] = { $in: regionArray };
    }

    // Grade level filter
    if (gradeLevels) {
      const gradeArray = gradeLevels.split(',').map(g => g.trim());
      filter['eligibility.gradeLevels'] = { $in: gradeArray };
    }

    // Subject filter
    if (subjects) {
      const subjectArray = subjects.split(',').map(s => s.trim());
      filter['eligibility.subjects'] = { $in: subjectArray };
    }

    // Funding type filter
    if (fundingTypes) {
      const fundingArray = fundingTypes.split(',').map(f => f.trim());
      filter['eligibility.fundingTypes'] = { $in: fundingArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
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

    // Add AI matching if user profile is provided
    if (req.query.userProfile) {
      try {
        const userProfile = JSON.parse(req.query.userProfile);
        
        if (AIMatcher) {
          // Use Python AI matcher if available
          const matcher = new AIMatcher();
          matcher.prepare_scholarship_data(scholarships);
          scholarships = matcher.score_all_scholarships(userProfile, scholarships);
        } else {
          // Use simple JavaScript matcher as fallback
          const matcher = new SimpleMatcher();
          scholarships = matcher.scoreAllScholarships(userProfile, scholarships);
        }
      } catch (error) {
        console.error('AI matching error:', error);
        // Continue without AI matching if there's an error
      }
    }

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
