const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Keep only the We Are Teachers grants (which are good quality)
    const weAreTeachersGrants = await Scholarship.find({ source: 'We Are Teachers' });
    console.log(`📊 Found ${weAreTeachersGrants.length} We Are Teachers grants to keep`);

    // Clear all opportunities
    await Scholarship.deleteMany({});
    console.log('🗑️  Cleared all opportunities');

    // Re-insert only the We Are Teachers grants
    if (weAreTeachersGrants.length > 0) {
      await Scholarship.insertMany(weAreTeachersGrants);
      console.log(`✅ Re-imported ${weAreTeachersGrants.length} We Are Teachers grants`);
    }

    // Check final status
    const totalOpportunities = await Scholarship.countDocuments();
    const grants = await Scholarship.countDocuments({ type: 'grant' });
    const scholarships = await Scholarship.countDocuments({ type: 'scholarship' });

    console.log('\n📊 Final Database Summary:');
    console.log(`Total opportunities: ${totalOpportunities}`);
    console.log(`Grants: ${grants}`);
    console.log(`Scholarships: ${scholarships}`);

    // Show sample of good opportunities
    console.log('\n📋 Sample opportunities:');
    const samples = await Scholarship.find({}).limit(3).select('title amount description source type');
    samples.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title} (${opp.type})`);
      console.log(`   Amount: $${opp.amount.min} - $${opp.amount.max} ${opp.amount.note || ''}`);
      console.log(`   Source: ${opp.source}`);
      console.log(`   Description: ${opp.description.substring(0, 100)}...`);
      console.log();
    });

    console.log('🚀 Database cleaned successfully!');
    console.log('📖 API endpoints:');
    console.log('   All opportunities: http://localhost:5001/api/scholarships');
    console.log('   Grants only: http://localhost:5001/api/scholarships?type=grant');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  }
}

cleanDatabase();
