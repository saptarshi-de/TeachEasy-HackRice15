#!/usr/bin/env python3
"""
Debug Script to Find the Issue
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers.grants_gov_scraper import GrantsGovScraper

def debug_scraper():
    """Debug the federal scraper"""
    print("🔍 Debugging Federal Scraper")
    print("=" * 40)
    
    try:
        scraper = GrantsGovScraper()
        print("✅ Scraper created successfully")
        
        # Test the data processing directly
        test_grant = {
            "title": "Test Grant",
            "description": "Test description",
            "organization": "Test Org",
            "website": "https://test.com",
            "amount_text": "$5,000 - $25,000",
            "deadline_text": "March 15, 2025",
            "grade_levels": "K-12",
            "subjects": "Any",
            "regions": "National",
            "districts": "National",
            "funding_types": "Professional Development, Classroom Supplies",
            "requirements": "Must be a teacher",
            "application_method": "Online",
            "documents_required": "Resume/CV, Budget Proposal",
            "contact_email": "test@test.com",
            "contact_phone": "(555) 123-4567",
            "tags": "Test, Grant",
            "difficulty": "Medium",
            "is_recurring": True
        }
        
        print("📋 Test grant data:")
        for key, value in test_grant.items():
            print(f"  {key}: {value} (type: {type(value)})")
        
        print("\n🧪 Testing data processing...")
        result = scraper.process_grant_data(test_grant)
        
        if result:
            print("✅ Data processing successful!")
            print(f"📊 Result: {result['title']}")
        else:
            print("❌ Data processing failed")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_scraper()
