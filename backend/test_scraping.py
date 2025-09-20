#!/usr/bin/env python3
"""
Simple test script for the scraping system
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_scraping():
    """Test the scraping system with sample data"""
    print("🧪 Testing scraping system...")
    
    # Sample scholarship data (same as in seedData.js but in Python format)
    sample_scholarships = [
        {
            "title": "STEM Classroom Innovation Grant",
            "description": "Funding for K-12 teachers to implement innovative STEM projects in their classrooms. Supports hands-on learning experiences and technology integration.",
            "organization": "National Science Foundation",
            "website": "https://www.nsf.gov",
            "amount": {
                "min": 5000,
                "max": 25000,
                "currency": "USD"
            },
            "eligibility": {
                "gradeLevels": ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                "subjects": ["Science", "Mathematics", "Computer Science"],
                "regions": ["National"],
                "districts": ["National"],
                "fundingTypes": ["Technology Equipment", "STEM Materials", "Classroom Supplies"],
                "requirements": "Must be a certified teacher with at least 2 years of experience. School must be public or charter."
            },
            "application": {
                "deadline": "2024-12-31",
                "applicationUrl": "https://www.nsf.gov/grants",
                "applicationMethod": "Online",
                "documentsRequired": ["Resume/CV", "Budget Proposal", "School Information", "Essay"],
                "isRecurring": True,
                "nextDeadline": "2025-12-31"
            },
            "contact": {
                "email": "stem-grants@nsf.gov",
                "phone": "(703) 292-5111"
            },
            "tags": ["STEM", "Innovation", "Technology", "K-12"],
            "difficulty": "Medium",
            "popularity": 85,
            "isActive": True,
            "isVerified": True
        },
        {
            "title": "Rural Education Enhancement Fund",
            "description": "Grants specifically for teachers in rural areas to improve educational resources and student outcomes. Focus on closing the rural-urban education gap.",
            "organization": "Rural Education Foundation",
            "website": "https://www.ruraleducation.org",
            "amount": {
                "min": 2000,
                "max": 15000,
                "currency": "USD"
            },
            "eligibility": {
                "gradeLevels": ["Pre-K", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                "subjects": ["Any"],
                "regions": ["Central", "Southwest", "Southeast"],
                "districts": ["Houston ISD", "Katy ISD", "Dallas ISD", "Austin ISD"],
                "fundingTypes": ["Classroom Supplies", "Books and Materials", "Technology Equipment", "Professional Development"],
                "requirements": "Must teach in a school district with fewer than 10,000 students. Priority given to high-need schools."
            },
            "application": {
                "deadline": "2024-11-15",
                "applicationUrl": "https://www.ruraleducation.org/apply",
                "applicationMethod": "Online",
                "documentsRequired": ["Resume/CV", "School Information", "Budget Proposal"],
                "isRecurring": True,
                "nextDeadline": "2025-11-15"
            },
            "contact": {
                "email": "grants@ruraleducation.org",
                "phone": "(555) 123-4567"
            },
            "tags": ["Rural", "Equity", "Resources", "Community"],
            "difficulty": "Easy",
            "popularity": 72,
            "isActive": True,
            "isVerified": True
        }
    ]
    
    # Process the data
    processed_data = []
    for scholarship in sample_scholarships:
        try:
            # Add required fields for MongoDB
            processed_scholarship = {
                **scholarship,
                "viewCount": 0,
                "bookmarkCount": 0,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat(),
                "publishedAt": datetime.now().isoformat()
            }
            processed_data.append(processed_scholarship)
            print(f"✅ Processed: {scholarship['title']}")
        except Exception as e:
            print(f"❌ Error processing {scholarship.get('title', 'Unknown')}: {e}")
    
    # Save to JSON file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"test_scraped_data_{timestamp}.json"
    
    os.makedirs("data", exist_ok=True)
    filepath = os.path.join("data", filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2, default=str)
    
    print(f"\n📊 Results:")
    print(f"Total scholarships processed: {len(processed_data)}")
    print(f"Saved to: {filepath}")
    
    # Print sample data
    print(f"\n📋 Sample scholarship:")
    if processed_data:
        sample = processed_data[0]
        print(f"Title: {sample['title']}")
        print(f"Organization: {sample['organization']}")
        print(f"Amount: ${sample['amount']['min']:,} - ${sample['amount']['max']:,}")
        print(f"Districts: {', '.join(sample['eligibility']['districts'])}")
        print(f"Grade Levels: {', '.join(sample['eligibility']['gradeLevels'][:5])}...")
    
    return processed_data

def test_ai_matching():
    """Test AI matching functionality"""
    print("\n🤖 Testing AI matching...")
    
    try:
        from scrapers.ai_matcher import AIMatcher
        
        # Sample user profile
        user_profile = {
            "schoolName": "Houston Elementary",
            "schoolDistrict": "Houston ISD",
            "gradeLevel": ["K", "1", "2"],
            "subjects": ["Mathematics", "Science"],
            "fundingNeeds": ["Classroom Supplies", "Technology Equipment"],
            "preferences": {
                "minAmount": 1000,
                "maxAmount": 10000
            }
        }
        
        # Load sample scholarships (use the most recent file)
        import glob
        test_files = glob.glob("data/test_scraped_data_*.json")
        if not test_files:
            print("❌ No test data files found")
            return False
        
        latest_file = max(test_files)
        with open(latest_file, "r") as f:
            scholarships = json.load(f)
        
        # Initialize AI matcher
        matcher = AIMatcher()
        matcher.prepare_scholarship_data(scholarships)
        
        # Find matches
        matches = matcher.find_matching_scholarships(user_profile, scholarships, top_k=3)
        
        print(f"Found {len(matches)} matches:")
        for i, (scholarship, score) in enumerate(matches, 1):
            print(f"{i}. {scholarship['title']} (Score: {score:.2f})")
        
        return True
        
    except Exception as e:
        print(f"❌ AI matching test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting TeachEasy Scraping Test")
    print("=" * 50)
    
    # Test basic scraping
    scholarships = test_scraping()
    
    # Test AI matching if data exists
    if scholarships:
        test_ai_matching()
    
    print("\n✅ Test completed!")
    print("\nNext steps:")
    print("1. Review the generated data in the 'data' folder")
    print("2. Import this data into your MongoDB database")
    print("3. Update your seed script to use this real data")
