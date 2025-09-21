const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Scholarship = require('../models/Scholarship');

// Load environment variables
dotenv.config();

// Sample scholarship data
const sampleScholarships = [
  {
    title: "STEM Classroom Innovation Grant",
    description: "Funding for K-12 teachers to implement innovative STEM projects in their classrooms. Supports hands-on learning experiences and technology integration.",
    organization: "National Science Foundation",
    website: "https://www.nsf.gov",
    amount: {
      min: 5000,
      max: 25000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Science", "Mathematics", "Computer Science"],
      regions: ["National"],
      fundingTypes: ["Technology Equipment", "STEM Materials", "Classroom Supplies"],
      requirements: "Must be a certified teacher with at least 2 years of experience. School must be public or charter."
    },
    application: {
      deadline: new Date("2024-12-31"),
      applicationUrl: "https://www.nsf.gov/grants",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-12-31")
    },
    contact: {
      email: "stem-grants@nsf.gov",
      phone: "(703) 292-5111"
    },
    tags: ["STEM", "Innovation", "Technology", "K-12"],
    difficulty: "Medium",
    popularity: 85,
    isActive: true,
    isVerified: true
  },
  {
    title: "Rural Education Enhancement Fund",
    description: "Grants specifically for teachers in rural areas to improve educational resources and student outcomes. Focus on closing the rural-urban education gap.",
    organization: "Rural Education Foundation",
    website: "https://www.ruraleducation.org",
    amount: {
      min: 2000,
      max: 15000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Any"],
      regions: ["Central", "Southwest", "Southeast"],
      fundingTypes: ["Classroom Supplies", "Books and Materials", "Technology Equipment", "Professional Development"],
      requirements: "Must teach in a school district with fewer than 10,000 students. Priority given to high-need schools."
    },
    application: {
      deadline: new Date("2024-11-15"),
      applicationUrl: "https://www.ruraleducation.org/apply",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "School Information", "Budget Proposal"],
      isRecurring: true,
      nextDeadline: new Date("2025-11-15")
    },
    contact: {
      email: "grants@ruraleducation.org",
      phone: "(555) 123-4567"
    },
    tags: ["Rural", "Equity", "Resources", "Community"],
    difficulty: "Easy",
    popularity: 72,
    isActive: true,
    isVerified: true
  },
  {
    title: "Arts Integration Professional Development Grant",
    description: "Funding for teachers to attend professional development workshops focused on integrating arts into core curriculum subjects.",
    organization: "Arts Education Partnership",
    website: "https://www.artsedpartnership.org",
    amount: {
      min: 1000,
      max: 5000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["K", "1", "2", "3", "4", "5", "6", "7", "8"],
      subjects: ["Art", "Music", "English/Language Arts", "Mathematics", "Science"],
      regions: ["National"],
      fundingTypes: ["Professional Development", "Field Trips", "Special Programs"],
      requirements: "Must be a current classroom teacher. Preference for teachers in Title I schools."
    },
    application: {
      deadline: new Date("2024-10-30"),
      applicationUrl: "https://www.artsedpartnership.org/grants",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Cover Letter", "Recommendation Letters"],
      isRecurring: false
    },
    contact: {
      email: "grants@artsedpartnership.org",
      phone: "(202) 326-8699"
    },
    tags: ["Arts", "Professional Development", "Integration", "Creative"],
    difficulty: "Easy",
    popularity: 68,
    isActive: true,
    isVerified: true
  },
  {
    title: "Special Education Resource Grant",
    description: "Comprehensive funding for special education teachers to enhance learning materials, assistive technology, and classroom resources for students with diverse needs.",
    organization: "Special Education Foundation",
    website: "https://www.specialedfoundation.org",
    amount: {
      min: 3000,
      max: 20000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Special Education"],
      regions: ["National"],
      fundingTypes: ["Technology Equipment", "Classroom Supplies", "Student Support"],
      requirements: "Must be a certified special education teacher. Must work with students with IEPs."
    },
    application: {
      deadline: new Date("2024-12-15"),
      applicationUrl: "https://www.specialedfoundation.org/apply",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-12-15")
    },
    contact: {
      email: "grants@specialedfoundation.org",
      phone: "(800) 555-0123"
    },
    tags: ["Special Education", "Assistive Technology", "Inclusion", "Support"],
    difficulty: "Medium",
    popularity: 78,
    isActive: true,
    isVerified: true
  },
  {
    title: "Environmental Education Initiative",
    description: "Grants for teachers to develop and implement environmental education programs, including outdoor learning spaces and sustainability projects.",
    organization: "Environmental Education Alliance",
    website: "https://www.eealliance.org",
    amount: {
      min: 1500,
      max: 12000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Science"],
      regions: ["National"],
      fundingTypes: ["Classroom Supplies", "Field Trips", "Special Programs", "Technology Equipment"],
      requirements: "Must incorporate environmental education into curriculum. Preference for schools with outdoor spaces."
    },
    application: {
      deadline: new Date("2024-11-30"),
      applicationUrl: "https://www.eealliance.org/grants",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-11-30")
    },
    contact: {
      email: "grants@eealliance.org",
      phone: "(555) 987-6543"
    },
    tags: ["Environment", "Sustainability", "Outdoor Learning", "Science"],
    difficulty: "Medium",
    popularity: 65,
    isActive: true,
    isVerified: true
  },
  {
    title: "Digital Literacy Enhancement Fund",
    description: "Funding to help teachers integrate digital literacy skills into their curriculum and provide students with access to modern technology tools.",
    organization: "Digital Learning Foundation",
    website: "https://www.digitallearning.org",
    amount: {
      min: 2500,
      max: 18000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Computer Science", "English/Language Arts", "Mathematics", "Science"],
      regions: ["National"],
      fundingTypes: ["Technology Equipment", "Classroom Supplies", "Professional Development"],
      requirements: "Must demonstrate need for technology resources. Priority for schools with limited tech access."
    },
    application: {
      deadline: new Date("2024-12-20"),
      applicationUrl: "https://www.digitallearning.org/apply",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-12-20")
    },
    contact: {
      email: "grants@digitallearning.org",
      phone: "(555) 456-7890"
    },
    tags: ["Digital Literacy", "Technology", "21st Century Skills", "Innovation"],
    difficulty: "Hard",
    popularity: 82,
    isActive: true,
    isVerified: true
  },
  {
    title: "Early Childhood Education Support Grant",
    description: "Funding for Pre-K and early elementary teachers to enhance learning environments and provide developmentally appropriate materials for young learners.",
    organization: "Early Learning Foundation",
    website: "https://www.earlylearning.org",
    amount: {
      min: 1000,
      max: 8000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["Pre-K", "K", "1", "2"],
      subjects: ["Any"],
      regions: ["National"],
      fundingTypes: ["Classroom Supplies", "Books and Materials", "Classroom Furniture", "Student Support"],
      requirements: "Must work with children ages 3-8. Priority for Title I schools and high-need communities."
    },
    application: {
      deadline: new Date("2024-10-15"),
      applicationUrl: "https://www.earlylearning.org/grants",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-10-15")
    },
    contact: {
      email: "grants@earlylearning.org",
      phone: "(555) 234-5678"
    },
    tags: ["Early Childhood", "Development", "Play-Based Learning", "Foundation"],
    difficulty: "Easy",
    popularity: 70,
    isActive: true,
    isVerified: true
  },
  {
    title: "Mathematics Excellence Initiative",
    description: "Grants for math teachers to implement innovative teaching methods, purchase manipulatives, and create engaging learning experiences for students.",
    organization: "Mathematics Education Foundation",
    website: "https://www.mathfoundation.org",
    amount: {
      min: 2000,
      max: 15000,
      currency: "USD"
    },
    eligibility: {
      gradeLevels: ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      subjects: ["Mathematics"],
      regions: ["National"],
      fundingTypes: ["Classroom Supplies", "Technology Equipment", "Professional Development", "Books and Materials"],
      requirements: "Must be a certified mathematics teacher. Must demonstrate innovative teaching approach."
    },
    application: {
      deadline: new Date("2024-11-20"),
      applicationUrl: "https://www.mathfoundation.org/apply",
      applicationMethod: "Online",
      documentsRequired: ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
      isRecurring: true,
      nextDeadline: new Date("2025-11-20")
    },
    contact: {
      email: "grants@mathfoundation.org",
      phone: "(555) 345-6789"
    },
    tags: ["Mathematics", "Innovation", "Manipulatives", "Engagement"],
    difficulty: "Medium",
    popularity: 75,
    isActive: true,
    isVerified: true
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
    console.log('✅ Connected to MongoDB');

    // Clear existing scholarships
    await Scholarship.deleteMany({});
    console.log('🗑️  Cleared existing scholarships');

    // Insert sample scholarships
    const insertedScholarships = await Scholarship.insertMany(sampleScholarships);
    console.log(`✅ Inserted ${insertedScholarships.length} sample scholarships`);

    // Display summary
    console.log('\n📊 Database seeded successfully!');
    console.log('Sample scholarships created:');
    insertedScholarships.forEach((scholarship, index) => {
      console.log(`${index + 1}. ${scholarship.title} - $${scholarship.amount.min.toLocaleString()} - $${scholarship.amount.max.toLocaleString()}`);
    });

    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('📖 API Documentation: http://localhost:5000/api/health');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();
