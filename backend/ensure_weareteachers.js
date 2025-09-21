const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function ensureWeAreTeachersScholarships() {
  try {
    console.log('🔍 Checking WeAreTeachers scholarships...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    
    const weareteachersCount = await Scholarship.countDocuments({ source: 'WeAreTeachers' });
    console.log(`📊 Found ${weareteachersCount} WeAreTeachers scholarships`);
    
    if (weareteachersCount === 0) {
      console.log('⚠️  No WeAreTeachers scholarships found. Re-importing...');
      
      // Find the latest converted scholarships file
      const convertedDir = __dirname;
      const files = fs.readdirSync(convertedDir)
        .filter(file => file.startsWith('converted_scholarships_') && file.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        console.log('❌ No converted scholarships file found. Please run convert_grants_to_scholarships.py first.');
        return;
      }
      
      const latestFile = files[0];
      console.log(`📁 Using file: ${latestFile}`);
      
      const scholarshipsData = JSON.parse(fs.readFileSync(path.join(convertedDir, latestFile), 'utf8'));
      console.log(`📊 Found ${scholarshipsData.length} scholarships to import`);
      
      // Import each scholarship
      for (let i = 0; i < scholarshipsData.length; i++) {
        const scholarshipData = scholarshipsData[i];
        
        try {
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
          
          if ((i + 1) % 10 === 0) {
            console.log(`  Imported ${i + 1}/${scholarshipsData.length} scholarships...`);
          }
        } catch (error) {
          console.error(`❌ Error importing scholarship ${i + 1}:`, error.message);
        }
      }
      
      console.log('✅ WeAreTeachers scholarships imported successfully!');
    } else {
      console.log('✅ WeAreTeachers scholarships are already present');
    }
    
    // Final count
    const finalCount = await Scholarship.countDocuments({ source: 'WeAreTeachers' });
    const totalCount = await Scholarship.countDocuments();
    console.log(`📈 Final counts: ${finalCount} WeAreTeachers, ${totalCount} total scholarships`);
    
  } catch (error) {
    console.error('❌ Error ensuring WeAreTeachers scholarships:', error);
  } finally {
    // Don't disconnect - let the main server keep the connection
    console.log('✅ WeAreTeachers check completed');
  }
}

// Run if called directly
if (require.main === module) {
  ensureWeAreTeachersScholarships();
}

module.exports = ensureWeAreTeachersScholarships;
