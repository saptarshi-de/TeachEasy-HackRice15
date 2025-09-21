const mongoose = require('mongoose');
const Discount = require('../models/Discount');
require('dotenv').config();

// Sample discount data
const sampleDiscounts = [
  {
    title: "Apple Education Discount",
    description: "Save on Mac, iPad, and accessories with Apple's education pricing",
    company: "Apple",
    category: "Technology",
    discountType: "Percentage",
    discountValue: "Up to 10% off",
    website: "https://www.apple.com/us-hed/shop",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    requirements: {
      teacherId: true,
      membership: "NEA",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "NEA Perks",
    status: "Active",
    isRecurring: true,
    tags: ["apple", "mac", "ipad", "technology", "computers"],
    imageUrl: "https://www.apple.com/v/apple-education/home/ag/images/overview/hero__drsxvj3b7t2q_large.jpg",
    featured: true,
    popularity: 95
  },
  {
    title: "Dell Educator Discount",
    description: "Special pricing on laptops, desktops, and accessories for educators",
    company: "Dell",
    category: "Technology",
    discountType: "Percentage",
    discountValue: "Up to 15% off",
    website: "https://www.dell.com/en-us/work/shop/dell-advantage",
    promoCode: "TEACHER15",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "NEA",
      minimumSpend: "$299",
      other: "Valid teacher ID required"
    },
    source: "NEA Perks",
    status: "Active",
    isRecurring: true,
    tags: ["dell", "laptop", "desktop", "technology", "computers"],
    imageUrl: "https://i.dell.com/sites/csdocuments/Shared-Content_data-Sheets_Documents/en/us/optiplex-7090-desktop-1.jpg",
    featured: true,
    popularity: 88
  },
  {
    title: "Staples Teacher Discount Program",
    description: "Exclusive savings on classroom supplies, technology, and office essentials",
    company: "Staples",
    category: "Shopping",
    discountType: "Percentage",
    discountValue: "15% off",
    website: "https://www.staples.com/s/teacher-discount",
    promoCode: "TEACHER15",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "Any",
      minimumSpend: "$50",
      other: "Valid teacher ID required"
    },
    source: "Retailer Website",
    status: "Active",
    isRecurring: true,
    tags: ["office supplies", "classroom", "technology", "education"],
    imageUrl: "https://www.staples.com/content/dam/b2b/en-us/images/category/teacher-discounts/teacher-discount-hero.jpg",
    featured: true,
    popularity: 92
  },
  {
    title: "Barnes & Noble Educator Discount",
    description: "Save on books, educational materials, and classroom supplies",
    company: "Barnes & Noble",
    category: "Books & Media",
    discountType: "Percentage",
    discountValue: "20% off",
    website: "https://www.barnesandnoble.com/h/educator-discount",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "NEA",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "NEA Perks",
    status: "Active",
    isRecurring: true,
    tags: ["books", "education", "classroom", "supplies"],
    imageUrl: "https://prodimage.images-bn.com/pimages/9780593429496_p0_v1_s1200x630.jpg",
    featured: true,
    popularity: 90
  },
  {
    title: "Hertz Car Rental Discount",
    description: "Save on car rentals for personal and business travel",
    company: "Hertz",
    category: "Travel",
    discountType: "Percentage",
    discountValue: "Up to 20% off",
    website: "https://www.hertz.com/rentacar/misc/index.jsp?targetPage=corporateDiscounts.jsp",
    promoCode: "CDP#1769870",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: false,
      membership: "NEA",
      minimumSpend: "",
      other: "NEA membership required"
    },
    source: "NEA Perks",
    status: "Active",
    isRecurring: true,
    tags: ["hertz", "car rental", "travel", "transportation"],
    imageUrl: "https://www.hertz.com/content/dam/hertz/global/images/car-rental/hero-images/hertz-car-rental-hero.jpg",
    featured: true,
    popularity: 75
  },
  {
    title: "Marriott Hotels Educator Discount",
    description: "Special rates at Marriott hotels worldwide for educators",
    company: "Marriott",
    category: "Travel",
    discountType: "Percentage",
    discountValue: "Up to 15% off",
    website: "https://www.marriott.com/default.mi",
    promoCode: "GOV",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "NEA",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "NEA Perks",
    status: "Active",
    isRecurring: true,
    tags: ["marriott", "hotel", "travel", "accommodation"],
    imageUrl: "https://cache.marriott.com/marriottassets/marriott/MCCTN/mcctn-exterior-0024-hor-feat.jpg",
    featured: true,
    popularity: 85
  },
  {
    title: "Best Buy Teacher Discount",
    description: "Save on technology, electronics, and classroom tech",
    company: "Best Buy",
    category: "Technology",
    discountType: "Percentage",
    discountValue: "Up to 20% off",
    website: "https://www.bestbuy.com/site/education/teacher-discounts/pcmcat748300578647.c",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "Any",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "Retailer Website",
    status: "Active",
    isRecurring: true,
    tags: ["technology", "electronics", "computers", "classroom tech"],
    imageUrl: "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/1234/12345678_sd.jpg",
    featured: false,
    popularity: 90
  },
  {
    title: "Verizon Teacher Discount",
    description: "Special rates on wireless plans and devices for educators",
    company: "Verizon",
    category: "Technology",
    discountType: "Fixed Amount",
    discountValue: "$10 off monthly",
    website: "https://www.verizon.com/discounts/teacher-discount",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "Any",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "Retailer Website",
    status: "Active",
    isRecurring: true,
    tags: ["wireless", "phone", "mobile", "telecommunications"],
    imageUrl: "https://www.verizon.com/content/dam/verizon/images/teacher-discount/teacher-discount-hero.jpg",
    featured: true,
    popularity: 82
  },
  {
    title: "Adobe Creative Cloud Teacher Discount",
    description: "Special pricing on Adobe Creative Suite for educators",
    company: "Adobe",
    category: "Technology",
    discountType: "Percentage",
    discountValue: "60% off",
    website: "https://www.adobe.com/education/students.html",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "Any",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "Retailer Website",
    status: "Active",
    isRecurring: true,
    tags: ["adobe", "creative", "software", "design"],
    imageUrl: "https://www.adobe.com/content/dam/cc/us/en/creative-cloud/education/teacher-discount/teacher-discount-hero.jpg",
    featured: true,
    popularity: 85
  },
  {
    title: "Canva Pro for Teachers",
    description: "Free Canva Pro access for educators and students",
    company: "Canva",
    category: "Technology",
    discountType: "Special Offer",
    discountValue: "Free Pro access",
    website: "https://www.canva.com/education/",
    promoCode: "",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    requirements: {
      teacherId: true,
      membership: "Any",
      minimumSpend: "",
      other: "Valid teacher ID required"
    },
    source: "Retailer Website",
    status: "Active",
    isRecurring: true,
    tags: ["design", "graphics", "presentations", "education"],
    imageUrl: "https://static.canva.com/static/images/canva-pro-teacher-discount.jpg",
    featured: true,
    popularity: 88
  }
];

async function importDiscounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Clear existing discounts
    await Discount.deleteMany({});
    console.log('🗑️ Cleared existing discounts');

    // Import sample discounts
    const importedDiscounts = [];
    for (const discountData of sampleDiscounts) {
      const discount = new Discount(discountData);
      await discount.save();
      importedDiscounts.push(discount);
      console.log(`✅ Imported: ${discount.title}`);
    }

    console.log(`\n🎉 Import completed successfully!`);
    console.log(`📊 Imported ${importedDiscounts.length} discounts`);

    // Display statistics
    const stats = await Discount.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📈 Statistics by Category:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} discounts`);
    });

    const featuredCount = await Discount.countDocuments({ featured: true });
    const activeCount = await Discount.countDocuments({ status: 'Active' });

    console.log(`\n⭐ Featured discounts: ${featuredCount}`);
    console.log(`🟢 Active discounts: ${activeCount}`);

    // Test API endpoints
    console.log('\n🧪 Testing API endpoints:');
    console.log('   Health check: http://localhost:5001/api/health');
    console.log('   Discounts: http://localhost:5001/api/discounts');
    console.log('   Featured: http://localhost:5001/api/discounts/featured');
    console.log('   Categories: http://localhost:5001/api/discounts/categories');
    console.log('   Companies: http://localhost:5001/api/discounts/companies');

  } catch (error) {
    console.error('❌ Error importing discounts:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the import
importDiscounts();
