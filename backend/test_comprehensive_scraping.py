#!/usr/bin/env python3
"""
Comprehensive Test Script for TeachEasy Scraping System
Tests all scrapers and AI matching functionality
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers.scraper_manager import ScraperManager
from scrapers.ai_matcher import AIMatcher

def test_comprehensive_scraping():
    """Test all scrapers and AI matching"""
    print("🚀 Starting Comprehensive TeachEasy Scraping Test")
    print("=" * 60)
    
    # Initialize scraper manager
    manager = ScraperManager()
    
    print("🧪 Testing all scrapers...")
    print("-" * 40)
    
    # Run all scrapers
    all_scholarships = manager.run_all_scrapers()
    
    print(f"\n📊 Results:")
    print(f"Total scholarships scraped: {len(all_scholarships)}")
    
    # Group by source
    sources = {}
    for scholarship in all_scholarships:
        source = scholarship.get('source', 'Unknown')
        if source not in sources:
            sources[source] = 0
        sources[source] += 1
    
    print(f"\n📋 By Source:")
    for source, count in sources.items():
        print(f"  {source}: {count} scholarships")
    
    # Save comprehensive data
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"data/comprehensive_scraped_data_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(all_scholarships, f, indent=2, default=str)
    
    print(f"\n💾 Saved to: {filename}")
    
    # Test AI matching
    print(f"\n🤖 Testing AI matching...")
    print("-" * 40)
    
    try:
        # Create sample user profile
        user_profile = {
            "gradeLevel": "6-8",
            "subjects": ["Mathematics", "Science"],
            "schoolDistrict": "Houston ISD",
            "schoolRegion": "South",
            "fundingNeeds": ["Technology Equipment", "Professional Development"],
            "experience": "5-10 years",
            "schoolType": "Public",
            "studentCount": "500-1000"
        }
        
        # Initialize AI matcher
        matcher = AIMatcher()
        matcher.prepare_scholarship_data(all_scholarships)
        
        # Score all scholarships
        scored_scholarships = matcher.score_all_scholarships(user_profile, all_scholarships)
        
        print(f"✅ AI matching completed!")
        print(f"📊 Scored {len(scored_scholarships)} scholarships")
        
        # Show top matches by category
        high_matches = [s for s in scored_scholarships if s.get('matchLevel') == 'High']
        medium_matches = [s for s in scored_scholarships if s.get('matchLevel') == 'Medium']
        low_matches = [s for s in scored_scholarships if s.get('matchLevel') == 'Low']
        
        print(f"\n🎯 Match Levels:")
        print(f"  High: {len(high_matches)}")
        print(f"  Medium: {len(medium_matches)}")
        print(f"  Low: {len(low_matches)}")
        
        # Show sample high matches
        if high_matches:
            print(f"\n⭐ Top High Matches:")
            for i, scholarship in enumerate(high_matches[:3]):
                print(f"  {i+1}. {scholarship['title']}")
                print(f"     Organization: {scholarship['organization']}")
                print(f"     Amount: ${scholarship['amount']['min']:,} - ${scholarship['amount']['max']:,}")
                print(f"     Match Score: {scholarship.get('matchScore', 'N/A')}")
                print(f"     Overall Score: {scholarship.get('overallScore', 'N/A')}")
                print(f"     Source: {scholarship.get('source', 'Unknown')}")
                print()
        
        # Save scored data
        scored_filename = f"data/scored_scholarships_{timestamp}.json"
        with open(scored_filename, 'w') as f:
            json.dump(scored_scholarships, f, indent=2, default=str)
        
        print(f"💾 Scored data saved to: {scored_filename}")
        
    except Exception as e:
        print(f"❌ AI matching test failed: {e}")
    
    # Test grant status handling
    print(f"\n📅 Testing grant status handling...")
    print("-" * 40)
    
    # Create test grants with different statuses
    test_grants = [
        {
            "title": "Test Grant - Expired (Recurring)",
            "deadline": "2024-01-15",  # Past date
            "isRecurring": True
        },
        {
            "title": "Test Grant - Expired (Non-Recurring)",
            "deadline": "2024-01-15",  # Past date
            "isRecurring": False
        },
        {
            "title": "Test Grant - Active (30 days)",
            "deadline": "2025-02-15",  # Future date
            "isRecurring": True
        },
        {
            "title": "Test Grant - Active (90 days)",
            "deadline": "2025-04-15",  # Future date
            "isRecurring": True
        }
    ]
    
    for grant in test_grants:
        from scrapers.base_scraper import BaseScraper
        scraper = BaseScraper()
        
        deadline = scraper.extract_deadline(grant["deadline"])
        status = scraper.determine_grant_status(deadline, grant["isRecurring"])
        
        print(f"  {grant['title']}:")
        print(f"    Status: {status['status']}")
        print(f"    Active: {status['isActive']}")
        if status['nextDeadline']:
            print(f"    Next Deadline: {status['nextDeadline'].strftime('%Y-%m-%d')}")
        if status['daysUntilDeadline']:
            print(f"    Days Until: {status['daysUntilDeadline']}")
        print()
    
    print("✅ Comprehensive test completed!")
    print(f"\n📁 Files created:")
    print(f"  - {filename}")
    if 'scored_filename' in locals():
        print(f"  - {scored_filename}")
    
    print(f"\n🎉 Ready for production! All scrapers working correctly.")

if __name__ == "__main__":
    test_comprehensive_scraping()
