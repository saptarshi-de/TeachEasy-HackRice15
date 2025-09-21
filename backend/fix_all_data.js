const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

async function fixAllData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Update all opportunities to have type: 'grant' and fix other fields
    const result = await Scholarship.updateMany(
      {},
      { 
        $set: { 
          type: 'grant',
          status: 'Open'
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} opportunities`);

    // Check final status
    const totalOpportunities = await Scholarship.countDocuments();
    const grants = await Scholarship.countDocuments({ type: 'grant' });
    const scholarships = await Scholarship.countDocuments({ type: 'scholarship' });

    console.log('\n📊 Final Database Summary:');
    console.log(`Total opportunities: ${totalOpportunities}`);
    console.log(`Grants: ${grants}`);
    console.log(`Scholarships: ${scholarships}`);

    // Show sample of opportunities
    console.log('\n📋 Sample opportunities:');
    const samples = await Scholarship.find({}).limit(3).select('title amount description source type');
    samples.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title} (${opp.type})`);
      console.log(`   Amount: $${opp.amount.min} - $${opp.amount.max} ${opp.amount.note || ''}`);
      console.log(`   Source: ${opp.source}`);
      console.log(`   Description: ${opp.description.substring(0, 100)}...`);
      console.log();
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error fixing data:', error);
  }
}

fixAllData();
