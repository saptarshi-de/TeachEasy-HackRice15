const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

async function addTypeField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Get all opportunities and update them one by one
    const opportunities = await Scholarship.find({});
    console.log(`📊 Found ${opportunities.length} opportunities to update`);

    for (const opp of opportunities) {
      await Scholarship.findByIdAndUpdate(opp._id, { type: 'grant' });
    }
    
    console.log(`✅ Updated ${opportunities.length} opportunities with type: 'grant'`);

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
    console.error('❌ Error adding type field:', error);
  }
}

addTypeField();
