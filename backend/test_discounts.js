const mongoose = require('mongoose');
const Discount = require('./models/Discount');
require('dotenv').config();

async function testDiscounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Test discount queries
    console.log('\n🧪 Testing Discount Queries:');
    
    // Test 1: Get all discounts
    const allDiscounts = await Discount.find({});
    console.log(`📊 Total discounts in database: ${allDiscounts.length}`);

    // Test 2: Get active discounts
    const now = new Date();
    const activeDiscounts = await Discount.find({
      status: 'Active',
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });
    console.log(`🟢 Active discounts: ${activeDiscounts.length}`);

    // Test 3: Get featured discounts
    const featuredDiscounts = await Discount.find({ featured: true });
    console.log(`⭐ Featured discounts: ${featuredDiscounts.length}`);

    // Test 4: Get discounts by category
    const techDiscounts = await Discount.find({ category: 'Technology' });
    console.log(`💻 Technology discounts: ${techDiscounts.length}`);

    // Test 5: Get discounts by source
    const neaDiscounts = await Discount.find({ source: 'NEA Perks' });
    console.log(`🏛️ NEA Perks discounts: ${neaDiscounts.length}`);

    // Test 6: Test virtual fields
    console.log('\n🔍 Testing Virtual Fields:');
    const sampleDiscount = await Discount.findOne();
    if (sampleDiscount) {
      console.log(`📅 Days until expiration: ${sampleDiscount.daysUntilExpiration}`);
      console.log(`⏰ Is expiring soon: ${sampleDiscount.isExpiringSoon}`);
    }

    // Test 7: Test static methods
    console.log('\n📋 Testing Static Methods:');
    const activeFromStatic = await Discount.getActiveDiscounts();
    console.log(`🟢 Active discounts (static method): ${activeFromStatic.length}`);

    const featuredFromStatic = await Discount.getFeaturedDiscounts(3);
    console.log(`⭐ Featured discounts (static method): ${featuredFromStatic.length}`);

    // Test 8: Display sample data
    console.log('\n📋 Sample Discounts:');
    const samples = await Discount.find({}).limit(3);
    samples.forEach((discount, index) => {
      console.log(`${index + 1}. ${discount.title}`);
      console.log(`   Company: ${discount.company}`);
      console.log(`   Discount: ${discount.discountValue}`);
      console.log(`   Category: ${discount.category}`);
      console.log(`   Source: ${discount.source}`);
      console.log(`   Featured: ${discount.featured ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('✅ All discount tests passed!');

  } catch (error) {
    console.error('❌ Error testing discounts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testDiscounts();
