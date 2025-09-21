const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');

// GET /api/discounts - Get all discounts with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      company,
      source,
      status = 'Active',
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};

    // Status filter
    if (status === 'Active') {
      const now = new Date();
      filter.status = 'Active';
      filter.validFrom = { $lte: now };
      filter.validUntil = { $gte: now };
    } else if (status) {
      filter.status = status;
    }

    // Category filter
    if (category) {
      filter.category = { $in: category.split(',') };
    }

    // Company filter
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }

    // Source filter
    if (source) {
      filter.source = { $in: source.split(',') };
    }

    // Featured filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [discounts, totalItems] = await Promise.all([
      Discount.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Discount.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Add computed fields
    const discountsWithComputed = discounts.map(discount => ({
      ...discount,
      daysUntilExpiration: Math.ceil((new Date(discount.validUntil) - new Date()) / (1000 * 60 * 60 * 24)),
      isExpiringSoon: Math.ceil((new Date(discount.validUntil) - new Date()) / (1000 * 60 * 60 * 24)) <= 7
    }));

    res.json({
      success: true,
      discounts: discountsWithComputed,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      filters: {
        category,
        company,
        source,
        status,
        featured,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discounts',
      error: error.message
    });
  }
});

// GET /api/discounts/featured - Get featured discounts
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const now = new Date();

    const featuredDiscounts = await Discount.getFeaturedDiscounts(parseInt(limit));

    res.json({
      success: true,
      discounts: featuredDiscounts,
      count: featuredDiscounts.length
    });

  } catch (error) {
    console.error('Error fetching featured discounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured discounts',
      error: error.message
    });
  }
});

// GET /api/discounts/categories - Get all available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Discount.distinct('category');
    
    res.json({
      success: true,
      categories: categories.sort()
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// GET /api/discounts/companies - Get all available companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await Discount.distinct('company');
    
    res.json({
      success: true,
      companies: companies.sort()
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// GET /api/discounts/sources - Get all available sources
router.get('/sources', async (req, res) => {
  try {
    const sources = await Discount.distinct('source');
    
    res.json({
      success: true,
      sources: sources.sort()
    });

  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sources',
      error: error.message
    });
  }
});

// GET /api/discounts/:id - Get single discount by ID
router.get('/:id', async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    // Add computed fields
    const discountWithComputed = {
      ...discount.toObject(),
      daysUntilExpiration: Math.ceil((new Date(discount.validUntil) - new Date()) / (1000 * 60 * 60 * 24)),
      isExpiringSoon: Math.ceil((new Date(discount.validUntil) - new Date()) / (1000 * 60 * 60 * 24)) <= 7
    };

    res.json({
      success: true,
      discount: discountWithComputed
    });

  } catch (error) {
    console.error('Error fetching discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discount',
      error: error.message
    });
  }
});

// POST /api/discounts - Create new discount (admin only)
router.post('/', async (req, res) => {
  try {
    // Note: In production, you would add proper authentication here

    const discount = new Discount(req.body);
    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      discount
    });

  } catch (error) {
    console.error('Error creating discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discount',
      error: error.message
    });
  }
});

// PUT /api/discounts/:id - Update discount (admin only)
router.put('/:id', async (req, res) => {
  try {
    // Note: In production, you would add proper authentication here

    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: 'Discount updated successfully',
      discount
    });

  } catch (error) {
    console.error('Error updating discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discount',
      error: error.message
    });
  }
});

// DELETE /api/discounts/:id - Delete discount (admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Note: In production, you would add proper authentication here

    const discount = await Discount.findByIdAndDelete(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: 'Discount deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discount',
      error: error.message
    });
  }
});

// GET /api/discounts/stats/overview - Get discount statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const now = new Date();
    
    const [
      totalDiscounts,
      activeDiscounts,
      expiredDiscounts,
      featuredDiscounts,
      categoryStats,
      sourceStats
    ] = await Promise.all([
      Discount.countDocuments(),
      Discount.countDocuments({
        status: 'Active',
        validFrom: { $lte: now },
        validUntil: { $gte: now }
      }),
      Discount.countDocuments({
        status: 'Expired'
      }),
      Discount.countDocuments({ featured: true }),
      Discount.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Discount.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total: totalDiscounts,
        active: activeDiscounts,
        expired: expiredDiscounts,
        featured: featuredDiscounts,
        categories: categoryStats,
        sources: sourceStats
      }
    });

  } catch (error) {
    console.error('Error fetching discount stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discount statistics',
      error: error.message
    });
  }
});

module.exports = router;
