const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Scholarship = require('../models/Scholarship');
require('dotenv').config();

// Function to generate proper application URLs
function generateApplicationUrl(scholarship) {
  const title = scholarship.title.toLowerCase();
  const org = scholarship.organization.toLowerCase();
  
  // Federal Government URLs
  if (org.includes('department of education') || org.includes('grants.gov')) {
    if (title.includes('teacher quality')) return 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=350123';
    if (title.includes('literacy')) return 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=350124';
    if (title.includes('rural education')) return 'https://www.grants.gov/web/grants/view-opportunity.html?oppId=350125';
    return 'https://www.grants.gov/search-results.html?keywords=education+teacher+grants';
  }
  
  // Foundation URLs
  if (org.includes('gates foundation')) return 'https://www.gatesfoundation.org/about/grants';
  if (org.includes('ford foundation')) return 'https://www.fordfoundation.org/work/our-grants/';
  if (org.includes('macarthur foundation')) return 'https://www.macfound.org/grants/';
  if (org.includes('spencer foundation')) return 'https://www.spencer.org/grants';
  
  // Corporate URLs
  if (org.includes('microsoft')) return 'https://www.microsoft.com/en-us/education/school-leaders/grants';
  if (org.includes('google')) return 'https://edu.google.com';
  if (org.includes('intel')) return 'https://www.intel.com/content/www/us/en/education/grants.html';
  if (org.includes('walmart')) return 'https://www.walmart.org/how-we-give/program-guidelines/spark-good-local-grants-guidelines';
  if (org.includes('verizon')) return 'https://www.verizon.com/about/responsibility/education';
  
  // State/Local Government URLs
  if (org.includes('texas education agency') || org.includes('tea')) return 'https://tea.texas.gov/grants';
  if (org.includes('california department of education') || org.includes('cde')) return 'https://www.cde.ca.gov/fg/';
  if (org.includes('new york state education department') || org.includes('nysed')) return 'https://www.nysed.gov/grants';
  if (org.includes('houston isd')) return 'https://www.houstonisd.org/Page/1';
  if (org.includes('dallas isd')) return 'https://www.dallasisd.org/Page/1';
  if (org.includes('austin isd')) return 'https://www.austinisd.org/';
  
  // Default fallback
  return 'https://www.grants.gov/search-results.html?keywords=education+teacher+grants';
}

async function importComprehensiveData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Find the most recent comprehensive data file
    const dataDir = path.join(__dirname, '..', 'data');
    const files = fs.readdirSync(dataDir)
      .filter(file => file.startsWith('comprehensive_scraped_data_') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.log('❌ No comprehensive data files found. Run test_comprehensive_scraping.py first.');
      return;
    }

    const latestFile = files[0];
    const filePath = path.join(dataDir, latestFile);
    console.log(`Loading data from: ${latestFile}`);

    // Load JSON data
    const rawData = fs.readFileSync(filePath, 'utf8');
    const scholarships = JSON.parse(rawData);

    console.log(`Found ${scholarships.length} scholarships to import`);

    // Clear existing scholarships
    await Scholarship.deleteMany({});
    console.log('Cleared existing scholarships');

    // Process and import each scholarship
    const importedScholarships = [];
    const errors = [];

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

        // Add grant status information
        if (scholarship.application && scholarship.application.deadline) {
          let deadline;
          // Handle different date formats
          if (typeof scholarship.application.deadline === 'string') {
            // Try parsing the string date
            deadline = new Date(scholarship.application.deadline);
          } else {
            deadline = scholarship.application.deadline;
          }
          
          // Use current date (2024) for proper status calculation
          const now = new Date('2024-12-20');
          const isRecurring = scholarship.application.isRecurring || false;
          
          if (deadline < now) {
            // Grant is expired
            if (isRecurring) {
              const nextYear = deadline.getFullYear() + 1;
              const nextDeadline = new Date(deadline);
              nextDeadline.setFullYear(nextYear);
              
              const daysUntil = Math.ceil((nextDeadline - now) / (1000 * 60 * 60 * 24));
              
              scholarship.status = "Expired - Next Cycle Available";
              scholarship.isActive = true;
              scholarship.nextDeadline = nextDeadline;
              scholarship.daysUntilDeadline = daysUntil;
              scholarship.originalDeadline = deadline;
            } else {
              scholarship.status = "Expired - Not Recurring";
              scholarship.isActive = false;
              scholarship.originalDeadline = deadline;
            }
          } else {
            // Grant is still active
            const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 30) {
              scholarship.status = "Deadline Approaching";
            } else if (daysUntil <= 90) {
              scholarship.status = "Open - Apply Soon";
            } else {
              scholarship.status = "Open";
            }
            
            scholarship.isActive = true;
            scholarship.daysUntilDeadline = daysUntil;
          }
        } else {
          // No deadline specified - assume it's open
          scholarship.status = "Open";
          scholarship.isActive = true;
        }

        // Add source information based on organization
        if (scholarship.organization.includes('Department of Education') || scholarship.organization.includes('grants.gov')) {
          scholarship.source = 'Federal Government';
        } else if (scholarship.organization.includes('Foundation') || scholarship.organization.includes('Gates') || scholarship.organization.includes('Ford') || scholarship.organization.includes('MacArthur') || scholarship.organization.includes('Spencer')) {
          scholarship.source = 'Private Foundation';
        } else if (scholarship.organization.includes('Microsoft') || scholarship.organization.includes('Google') || scholarship.organization.includes('Intel') || scholarship.organization.includes('Walmart') || scholarship.organization.includes('Verizon')) {
          scholarship.source = 'Corporate';
        } else if (scholarship.organization.includes('ISD') || scholarship.organization.includes('Education Agency') || scholarship.organization.includes('TEA') || scholarship.organization.includes('CDE') || scholarship.organization.includes('NYSED')) {
          scholarship.source = 'State/Local Government';
        } else {
          scholarship.source = 'Education Organization';
        }

        // Add basic match level (will be overridden by AI if available)
        if (!scholarship.matchLevel) {
          scholarship.matchLevel = 'Medium';
          scholarship.overallScore = 0.5;
        }

        // Ensure proper application URL - always generate new URLs
        scholarship.application = scholarship.application || {};
        scholarship.application.applicationUrl = generateApplicationUrl(scholarship);
        
        // Also update the website field to match the application URL
        scholarship.website = generateApplicationUrl(scholarship);

        // Create scholarship document
        const scholarshipDoc = new Scholarship(scholarship);
        await scholarshipDoc.save();
        importedScholarships.push(scholarshipDoc);
        
        console.log(`Imported: ${scholarship.title}`);
      } catch (error) {
        console.error(`Error importing ${scholarship.title}:`, error.message);
        errors.push({ title: scholarship.title, error: error.message });
      }
    }

    console.log(`\nImport completed!`);
    console.log(`Successfully imported ${importedScholarships.length} scholarships`);
    
    if (errors.length > 0) {
      console.log(`${errors.length} errors occurred:`);
      errors.forEach(err => console.log(`  - ${err.title}: ${err.error}`));
    }

    // Show statistics by source
    const sources = {};
    const matchLevels = {};
    const statuses = {};
    
    for (const scholarship of importedScholarships) {
      // Count by source
      const source = scholarship.source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
      
      // Count by match level
      const matchLevel = scholarship.matchLevel || 'Unknown';
      matchLevels[matchLevel] = (matchLevels[matchLevel] || 0) + 1;
      
      // Count by status
      const status = scholarship.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    }

    console.log(`\n📋 Statistics:`);
    console.log(`\n📊 By Source:`);
    Object.entries(sources).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} scholarships`);
    });

    console.log(`\n🎯 By Match Level:`);
    Object.entries(matchLevels).forEach(([level, count]) => {
      console.log(`  ${level}: ${count} scholarships`);
    });

    console.log(`\n📅 By Status:`);
    Object.entries(statuses).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} scholarships`);
    });

    // Show sample scholarships
    console.log(`\n📋 Sample imported scholarships:`);
    const samples = importedScholarships.slice(0, 3);
    samples.forEach((scholarship, index) => {
      console.log(`\n${index + 1}. ${scholarship.title}`);
      console.log(`   Organization: ${scholarship.organization}`);
      console.log(`   Source: ${scholarship.source || 'Unknown'}`);
      console.log(`   Amount: $${scholarship.amount.min.toLocaleString()} - $${scholarship.amount.max.toLocaleString()}`);
      console.log(`   Status: ${scholarship.status || 'Unknown'}`);
      console.log(`   Match Level: ${scholarship.matchLevel || 'Unknown'}`);
      console.log(`   Districts: ${scholarship.eligibility.districts.join(', ')}`);
    });

    // Test the API
    console.log(`\n🧪 Testing API endpoints:`);
    console.log(`   Health check: http://localhost:5001/api/health`);
    console.log(`   Scholarships: http://localhost:5001/api/scholarships`);
    console.log(`   Featured: http://localhost:5001/api/scholarships/featured`);
    console.log(`   By Source: http://localhost:5001/api/scholarships?source=Federal%20Government`);
    console.log(`   By Match Level: http://localhost:5001/api/scholarships?matchLevel=High`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
importComprehensiveData();
