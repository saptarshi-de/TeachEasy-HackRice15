const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const router = express.Router();

// Get user's applications
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    const applications = await Application.getUserApplications(userId, status);
    
    res.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications' 
    });
  }
});

// Create new application
router.post('/', async (req, res) => {
  try {
    const { userId, scholarshipId, notes = '' } = req.body;
    
    // Convert scholarshipId to ObjectId
    const scholarshipObjectId = new mongoose.Types.ObjectId(scholarshipId);
    
    // Check if user already applied to this scholarship
    const existingApplication = await Application.hasUserApplied(userId, scholarshipObjectId);
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this scholarship'
      });
    }
    
    // Get scholarship details
    const scholarship = await Scholarship.findById(scholarshipObjectId);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: 'Scholarship not found'
      });
    }
    
    // Create application
    const application = new Application({
      userId,
      scholarshipId: scholarshipObjectId,
      scholarshipTitle: scholarship.title,
      organization: scholarship.organization,
      amount: {
        min: scholarship.amount.min,
        max: scholarship.amount.max,
        display: scholarship.amount.display || `$${scholarship.amount.min.toLocaleString()} - $${scholarship.amount.max.toLocaleString()}`
      },
      applicationUrl: scholarship.application?.applicationUrl || scholarship.application?.website || '',
      deadline: new Date(scholarship.application?.deadline),
      notes
    });
    
    await application.save();
    
    res.json({
      success: true,
      application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to create application: ${error.message}` 
    });
  }
});

// Update application status
router.put('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    
    await application.save();
    
    res.json({
      success: true,
      application,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update application' 
    });
  }
});

// Delete application (soft delete)
router.delete('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    application.isActive = false;
    await application.save();
    
    res.json({
      success: true,
      message: 'Application removed successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete application' 
    });
  }
});

// Check if user has applied to a specific scholarship
router.get('/check/:userId/:scholarshipId', async (req, res) => {
  try {
    const { userId, scholarshipId } = req.params;
    
    const hasApplied = await Application.hasUserApplied(userId, scholarshipId);
    
    res.json({
      success: true,
      hasApplied: !!hasApplied,
      application: hasApplied
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check application status' 
    });
  }
});

// Get application statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const totalApplications = await Application.countDocuments({ userId, isActive: true });
    const underReview = await Application.countDocuments({ userId, status: 'Under Review', isActive: true });
    const approved = await Application.countDocuments({ userId, status: 'Approved', isActive: true });
    const rejected = await Application.countDocuments({ userId, status: 'Rejected', isActive: true });
    
    res.json({
      success: true,
      stats: {
        total: totalApplications,
        underReview,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch application statistics' 
    });
  }
});

module.exports = router;