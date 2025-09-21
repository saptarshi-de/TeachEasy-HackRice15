import sys
import os
from datetime import datetime
import json
import logging

# Add the parent directory to the path to import scrapers
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.nea_perks_scraper import NEAPerksScraper
from scrapers.retailer_discounts_scraper import RetailerDiscountsScraper

class DiscountManager:
    """Manager class to coordinate all discount scrapers"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.scrapers = [
            NEAPerksScraper(),
            RetailerDiscountsScraper()
        ]
        
        # Ensure data directory exists
        os.makedirs('data', exist_ok=True)
    
    def run_all_scrapers(self):
        """Run all discount scrapers and combine results"""
        self.logger.info("Starting discount scraping process...")
        all_discounts = []
        
        for scraper in self.scrapers:
            try:
                self.logger.info(f"Running {scraper.name} scraper...")
                discounts = scraper.scrape_discounts()
                all_discounts.extend(discounts)
                self.logger.info(f"✅ {scraper.name}: {len(discounts)} discounts found")
                
            except Exception as e:
                self.logger.error(f"❌ {scraper.name} failed: {e}")
                continue
        
        # Save combined results
        if all_discounts:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"data/all_discounts_{timestamp}.json"
            
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    json.dump(all_discounts, f, indent=2, default=str)
                
                self.logger.info(f"💾 Saved {len(all_discounts)} total discounts to {filename}")
                return filename
                
            except Exception as e:
                self.logger.error(f"Error saving combined discounts: {e}")
                return None
        else:
            self.logger.warning("No discounts found by any scraper")
            return None
    
    def get_scraper_stats(self):
        """Get statistics from all scrapers"""
        stats = {
            'total_scrapers': len(self.scrapers),
            'scrapers': []
        }
        
        for scraper in self.scrapers:
            try:
                discounts = scraper.scrape_discounts()
                scraper_stats = {
                    'name': scraper.name,
                    'base_url': scraper.base_url,
                    'discounts_found': len(discounts),
                    'status': 'success'
                }
                
                # Add category breakdown
                categories = {}
                for discount in discounts:
                    category = discount.get('category', 'Other')
                    categories[category] = categories.get(category, 0) + 1
                
                scraper_stats['categories'] = categories
                stats['scrapers'].append(scraper_stats)
                
            except Exception as e:
                stats['scrapers'].append({
                    'name': scraper.name,
                    'base_url': scraper.base_url,
                    'discounts_found': 0,
                    'status': 'failed',
                    'error': str(e)
                })
        
        return stats
    
    def run_individual_scraper(self, scraper_name):
        """Run a specific scraper by name"""
        for scraper in self.scrapers:
            if scraper.name.lower() == scraper_name.lower():
                try:
                    self.logger.info(f"Running {scraper.name} scraper...")
                    discounts = scraper.scrape_discounts()
                    
                    # Save individual results
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"data/{scraper.name.lower().replace(' ', '_')}_{timestamp}.json"
                    
                    with open(filename, 'w', encoding='utf-8') as f:
                        json.dump(discounts, f, indent=2, default=str)
                    
                    self.logger.info(f"✅ {scraper.name}: {len(discounts)} discounts saved to {filename}")
                    return filename
                    
                except Exception as e:
                    self.logger.error(f"❌ {scraper.name} failed: {e}")
                    return None
        
        self.logger.error(f"Scraper '{scraper_name}' not found")
        return None

def main():
    """Main function for testing the discount manager"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    manager = DiscountManager()
    
    print("🎯 Discount Manager Test")
    print("=" * 50)
    
    # Test individual scrapers
    print("\n📊 Testing individual scrapers...")
    stats = manager.get_scraper_stats()
    
    for scraper_stat in stats['scrapers']:
        status_icon = "✅" if scraper_stat['status'] == 'success' else "❌"
        print(f"{status_icon} {scraper_stat['name']}: {scraper_stat['discounts_found']} discounts")
        
        if 'categories' in scraper_stat:
            for category, count in scraper_stat['categories'].items():
                print(f"   📂 {category}: {count} discounts")
    
    # Run all scrapers
    print(f"\n🚀 Running all {stats['total_scrapers']} scrapers...")
    result_file = manager.run_all_scrapers()
    
    if result_file:
        print(f"✅ All discounts saved to: {result_file}")
        
        # Load and show sample data
        with open(result_file, 'r') as f:
            data = json.load(f)
        
        print(f"\n📋 Sample discounts found:")
        for i, discount in enumerate(data[:3]):
            print(f"{i+1}. {discount['title']} - {discount['company']}")
            print(f"   💰 {discount['discountValue']} | 📂 {discount['category']}")
            print(f"   🔗 {discount['website']}")
            print()
    else:
        print("❌ No discounts were saved")

if __name__ == "__main__":
    main()
