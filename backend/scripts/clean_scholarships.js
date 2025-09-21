const mongoose = require('mongoose');
const Scholarship = require('../models/Scholarship');
const Discount = require('../models/Discount');
require('dotenv').config();

async function cleanScholarships() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Count scholarships before deletion
    const scholarshipCount = await Scholarship.countDocuments();
    console.log(`📊 Found ${scholarshipCount} scholarships in database`);

    // Count discounts before deletion (should remain)
    const discountCount = await Discount.countDocuments();
    console.log(`🎁 Found ${discountCount} discounts in database`);

    if (scholarshipCount > 0) {
      // Delete all scholarships
      await Scholarship.deleteMany({});
      console.log('🗑️ Deleted all scholarships from database');
    } else {
      console.log('ℹ️ No scholarships found to delete');
    }

    // Verify discounts are still intact
    const remainingDiscounts = await Discount.countDocuments();
    console.log(`✅ Discounts remain intact: ${remainingDiscounts} discounts`);

    // Show final counts
    const finalScholarshipCount = await Scholarship.countDocuments();
    const finalDiscountCount = await Discount.countDocuments();

    console.log('\n📊 Final Database State:');
    console.log(`   Scholarships: ${finalScholarshipCount}`);
    console.log(`   Discounts: ${finalDiscountCount}`);

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('🎯 Scholarships removed, discounts preserved');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

cleanScholarships();
