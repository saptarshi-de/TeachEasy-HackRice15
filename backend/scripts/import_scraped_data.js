const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scholarship = require('../models/Scholarship');
require('dotenv').config();

async function importScrapedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Find the most recent test data file
    const dataDir = path.join(__dirname, '..', 'data');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('test_scraped_data_') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('❌ No test data files found. Run test_scraping.py first.');
      return;
    }

    const latestFile = files[0];
    const filePath = path.join(dataDir, latestFile);
    console.log(`📁 Loading data from: ${latestFile}`);

    // Load JSON data
    const rawData = fs.readFileSync(filePath, 'utf8');
    const scholarships = JSON.parse(rawData);

    console.log(`📊 Found ${scholarships.length} scholarships to import`);

    // Clear existing scholarships
    await Scholarship.deleteMany({});
    console.log('🗑️  Cleared existing scholarships');

    // Process and import each scholarship
    const importedScholarships = [];
    for (const scholarship of scholarships) {
      try {
        // Convert date strings to Date objects
        if (scholarship.createdAt) {
          scholarship.createdAt = new Date(scholarship.createdAt);
        }
        if (scholarship.updatedAt) {
          scholarship.updatedAt = new Date(scholarship.updatedAt);
        }
        if (scholarship.publishedAt) {
          scholarship.publishedAt = new Date(scholarship.publishedAt);
        }
        if (scholarship.application && scholarship.application.deadline) {
          scholarship.application.deadline = new Date(scholarship.application.deadline);
        }
        if (scholarship.application && scholarship.application.nextDeadline) {
          scholarship.application.nextDeadline = new Date(scholarship.application.nextDeadline);
        }

        // Create scholarship document
        const scholarshipDoc = new Scholarship(scholarship);
        await scholarshipDoc.save();
        importedScholarships.push(scholarshipDoc);
        
        console.log(`✅ Imported: ${scholarship.title}`);
      } catch (error) {
        console.error(`❌ Error importing ${scholarship.title}:`, error.message);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Successfully imported ${importedScholarships.length} scholarships`);
    console.log(`\n📋 Sample imported scholarship:`);
    if (importedScholarships.length > 0) {
      const sample = importedScholarships[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Organization: ${sample.organization}`);
      console.log(`   Amount: $${sample.amount.min.toLocaleString()} - $${sample.amount.max.toLocaleString()}`);
      console.log(`   Districts: ${sample.eligibility.districts.join(', ')}`);
      console.log(`   Grade Levels: ${sample.eligibility.gradeLevels.slice(0, 5).join(', ')}...`);
    }

    // Test the API
    console.log(`\n🧪 Testing API endpoints:`);
    console.log(`   Health check: http://localhost:5001/api/health`);
    console.log(`   Scholarships: http://localhost:5001/api/scholarships`);
    console.log(`   Featured: http://localhost:5001/api/scholarships/featured`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
importScrapedData();
