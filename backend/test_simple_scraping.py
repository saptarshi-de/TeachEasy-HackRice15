#!/usr/bin/env python3
"""
Simple Test Script for Individual Scrapers
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scrapers.grants_gov_scraper import GrantsGovScraper
from scrapers.foundation_scraper import FoundationScraper
from scrapers.corporate_scraper import CorporateScraper
from scrapers.state_local_scraper import StateLocalScraper

def test_individual_scrapers():
    """Test each scraper individually"""
    print("🧪 Testing Individual Scrapers")
    print("=" * 50)
    
    # Test Federal Scraper
    print("\n1. Testing Federal Scraper...")
    try:
        federal_scraper = GrantsGovScraper()
        federal_data = federal_scraper.scrape_scholarships()
        print(f"   ✅ Federal scraper returned {len(federal_data)} scholarships")
        if federal_data:
            print(f"   📋 Sample: {federal_data[0]['title']}")
    except Exception as e:
        print(f"   ❌ Federal scraper failed: {e}")
    
    # Test Foundation Scraper
    print("\n2. Testing Foundation Scraper...")
    try:
        foundation_scraper = FoundationScraper()
        foundation_data = foundation_scraper.scrape_scholarships()
        print(f"   ✅ Foundation scraper returned {len(foundation_data)} scholarships")
        if foundation_data:
            print(f"   📋 Sample: {foundation_data[0]['title']}")
    except Exception as e:
        print(f"   ❌ Foundation scraper failed: {e}")
    
    # Test Corporate Scraper
    print("\n3. Testing Corporate Scraper...")
    try:
        corporate_scraper = CorporateScraper()
        corporate_data = corporate_scraper.scrape_scholarships()
        print(f"   ✅ Corporate scraper returned {len(corporate_data)} scholarships")
        if corporate_data:
            print(f"   📋 Sample: {corporate_data[0]['title']}")
    except Exception as e:
        print(f"   ❌ Corporate scraper failed: {e}")
    
    # Test State/Local Scraper
    print("\n4. Testing State/Local Scraper...")
    try:
        state_scraper = StateLocalScraper()
        state_data = state_scraper.scrape_scholarships()
        print(f"   ✅ State/Local scraper returned {len(state_data)} scholarships")
        if state_data:
            print(f"   📋 Sample: {state_data[0]['title']}")
    except Exception as e:
        print(f"   ❌ State/Local scraper failed: {e}")
    
    print("\n✅ Individual scraper tests completed!")

if __name__ == "__main__":
    test_individual_scrapers()
