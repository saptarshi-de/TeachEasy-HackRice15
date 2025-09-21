const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importWeAreTeachersScholarships() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Find the latest converted scholarships file
    const files = fs.readdirSync('.')
      .filter(file => file.startsWith('converted_scholarships_') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      console.log('❌ No converted scholarships file found. Run convert_grants_to_scholarships.py first.');
      return;
    }
    
    const latestFile = files[0];
    console.log(`📁 Reading scholarships from: ${latestFile}`);
    
    // Read the scholarships file
    const scholarshipsData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    console.log(`📊 Found ${scholarshipsData.length} scholarships to import`);
    
    // Clear existing WeAreTeachers scholarships
    const deleteResult = await Scholarship.deleteMany({ source: 'WeAreTeachers' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing WeAreTeachers scholarships`);
    
    // Import new scholarships
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < scholarshipsData.length; i++) {
      const scholarshipData = scholarshipsData[i];
      
      try {
        // Create new scholarship document
        const scholarship = new Scholarship({
          title: scholarshipData.title,
          organization: scholarshipData.organization,
          description: scholarshipData.description,
          amount: scholarshipData.amount,
          eligibility: scholarshipData.eligibility,
          application: scholarshipData.application,
          status: scholarshipData.status,
          isActive: scholarshipData.isActive,
          source: scholarshipData.source,
          tags: scholarshipData.tags,
          createdAt: new Date(scholarshipData.createdAt),
          updatedAt: new Date(scholarshipData.updatedAt)
        });
        
        await scholarship.save();
        importedCount++;
        
        if (importedCount % 10 === 0) {
          console.log(`  Imported ${importedCount}/${scholarshipsData.length} scholarships...`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error importing scholarship ${i+1}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total scholarships: ${scholarshipsData.length}`);
    console.log(`   Successfully imported: ${importedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Verify import
    const totalScholarships = await Scholarship.countDocuments();
    const weareteachersScholarships = await Scholarship.countDocuments({ source: 'WeAreTeachers' });
    
    console.log(`\n📈 Database Status:`);
    console.log(`   Total scholarships in database: ${totalScholarships}`);
    console.log(`   WeAreTeachers scholarships: ${weareteachersScholarships}`);
    
    // Show sample scholarships
    const sampleScholarships = await Scholarship.find({ source: 'WeAreTeachers' }).limit(3);
    console.log(`\n📋 Sample imported scholarships:`);
    sampleScholarships.forEach((scholarship, index) => {
      console.log(`   ${index + 1}. ${scholarship.title}`);
      console.log(`      Organization: ${scholarship.organization}`);
      console.log(`      Amount: $${scholarship.amount.min.toLocaleString()} - $${scholarship.amount.max.toLocaleString()}`);
      console.log(`      Status: ${scholarship.status}`);
      console.log(`      Tags: ${scholarship.tags.join(', ')}`);
      console.log();
    });
    
    console.log('✅ WeAreTeachers scholarships import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing scholarships:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
importWeAreTeachersScholarships();
