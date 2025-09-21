const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Get one opportunity and see its raw data
    const opp = await Scholarship.findOne({});
    console.log('Raw opportunity data:');
    console.log(JSON.stringify(opp, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugData();
