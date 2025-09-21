const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');

// Middleware to verify Auth0 token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    // In a real app, you'd verify the JWT token here
    // For now, we'll extract the user ID from the token
    req.userId = token; // This should be the Auth0 user ID
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Apply middleware to all routes
router.use(verifyToken);

// Track application submission
router.post('/track', async (req, res) => {
  try {
    const { scholarshipId, applicationUrl, notes, documentsSubmitted } = req.body;
    const auth0Id = req.userId;

    // Verify scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    // Find or create user
    let user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found. Please create your profile first.' });
    }

    // Check if already applied
    const existingApplication = user.applications.find(
      app => app.scholarshipId.toString() === scholarshipId
    );

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this scholarship' });
    }

    // Add application to user's applications array
    user.applications.push({
      scholarshipId,
      applicationUrl,
      notes: notes || '',
      documentsSubmitted: documentsSubmitted || [],
      status: 'Applied'
    });

    await user.save();

    res.json({
      message: 'Application tracked successfully',
      application: user.applications[user.applications.length - 1]
    });

  } catch (error) {
    console.error('Error tracking application:', error);
    res.status(500).json({ error: 'Failed to track application' });
  }
});

// Get user's application history
router.get('/history', async (req, res) => {
  try {
    const auth0Id = req.userId;

    const user = await User.findOne({ auth0Id })
      .populate('applications.scholarshipId', 'title organization amount application.deadline')
      .select('applications');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort applications by appliedAt date (newest first)
    const sortedApplications = user.applications.sort((a, b) => 
      new Date(b.appliedAt) - new Date(a.appliedAt)
    );

    res.json({
      applications: sortedApplications,
      total: sortedApplications.length
    });

  } catch (error) {
    console.error('Error fetching application history:', error);
    res.status(500).json({ error: 'Failed to fetch application history' });
  }
});

// Update application status
router.put('/:applicationId/status', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, result } = req.body;
    const auth0Id = req.userId;

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const application = user.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application
    application.status = status;
    if (notes) application.notes = notes;
    if (result) {
      application.result = { ...application.result, ...result };
    }

    await user.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Get application statistics
router.get('/stats', async (req, res) => {
  try {
    const auth0Id = req.userId;

    const user = await User.findOne({ auth0Id }).select('applications');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const applications = user.applications;
    const stats = {
      total: applications.length,
      applied: applications.filter(app => app.status === 'Applied').length,
      underReview: applications.filter(app => app.status === 'Under Review').length,
      approved: applications.filter(app => app.status === 'Approved').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
      totalAwarded: applications
        .filter(app => app.status === 'Approved' && app.result?.amountAwarded)
        .reduce((sum, app) => sum + (app.result.amountAwarded || 0), 0)
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
});

// Delete application
router.delete('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const auth0Id = req.userId;

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const application = user.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.remove();
    await user.save();

    res.json({ message: 'Application deleted successfully' });

  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
