const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    const totalOpportunities = await Scholarship.countDocuments();
    const grants = await Scholarship.countDocuments({ type: 'grant' });
    const scholarships = await Scholarship.countDocuments({ type: 'scholarship' });
    const weAreTeachers = await Scholarship.countDocuments({ source: 'We Are Teachers' });

    console.log('\n📊 Database Summary:');
    console.log(`Total opportunities: ${totalOpportunities}`);
    console.log(`Grants: ${grants}`);
    console.log(`Scholarships: ${scholarships}`);
    console.log(`We Are Teachers grants: ${weAreTeachers}`);

    // Check for duplicate amounts
    const amountCounts = await Scholarship.aggregate([
      { $group: { _id: { min: '$amount.min', max: '$amount.max' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    console.log('\n💰 Most Common Amount Ranges:');
    amountCounts.forEach(amount => {
      console.log(`   $${amount._id.min} - $${amount._id.max}: ${amount.count} opportunities`);
    });

    // Sample opportunities
    console.log('\n📋 Sample opportunities:');
    const samples = await Scholarship.find({}).limit(3).select('title amount description source type');
    samples.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title} (${opp.type})`);
      console.log(`   Amount: $${opp.amount.min} - $${opp.amount.max}`);
      console.log(`   Source: ${opp.source}`);
      console.log(`   Description: ${opp.description.substring(0, 100)}...`);
      console.log();
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
