import schedule
import time
import logging
from datetime import datetime
from typing import List, Dict
from .education_grant_scraper import EducationGrantScraper
from .base_scraper import BaseScraper
import json
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScraperManager:
    """Manages all scrapers and data processing"""
    
    def __init__(self):
        self.scrapers = [
            EducationGrantScraper(),
            # Add more scrapers here as you implement them
        ]
        self.scraped_data = []
        
    def run_all_scrapers(self) -> List[Dict]:
        """Run all configured scrapers"""
        logger.info("Starting scraping process...")
        
        all_scholarships = []
        
        for scraper in self.scrapers:
            try:
                logger.info(f"Running {scraper.__class__.__name__}...")
                scholarships = scraper.scrape_scholarships()
                all_scholarships.extend(scholarships)
                logger.info(f"Scraped {len(scholarships)} scholarships from {scraper.__class__.__name__}")
            except Exception as e:
                logger.error(f"Error running {scraper.__class__.__name__}: {e}")
        
        # Remove duplicates based on title and organization
        unique_scholarships = self.remove_duplicates(all_scholarships)
        
        logger.info(f"Total unique scholarships scraped: {len(unique_scholarships)}")
        self.scraped_data = unique_scholarships
        
        return unique_scholarships
    
    def remove_duplicates(self, scholarships: List[Dict]) -> List[Dict]:
        """Remove duplicate scholarships based on title and organization"""
        seen = set()
        unique = []
        
        for scholarship in scholarships:
            key = (scholarship.get('title', '').lower(), scholarship.get('organization', '').lower())
            if key not in seen:
                seen.add(key)
                unique.append(scholarship)
        
        return unique
    
    def save_to_json(self, filename: str = None) -> str:
        """Save scraped data to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scraped_scholarships_{timestamp}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_data, f, indent=2, default=str)
        
        logger.info(f"Saved {len(self.scraped_data)} scholarships to {filepath}")
        return filepath
    
    def load_from_json(self, filename: str) -> List[Dict]:
        """Load scraped data from JSON file"""
        filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"Loaded {len(data)} scholarships from {filepath}")
            return data
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            return []
        except Exception as e:
            logger.error(f"Error loading file: {e}")
            return []
    
    def schedule_scraping(self, interval_hours: int = 24):
        """Schedule automatic scraping"""
        schedule.every(interval_hours).hours.do(self.run_all_scrapers)
        
        logger.info(f"Scheduled scraping every {interval_hours} hours")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def get_scraping_stats(self) -> Dict:
        """Get statistics about scraped data"""
        if not self.scraped_data:
            return {"total": 0, "by_organization": {}, "by_difficulty": {}}
        
        stats = {
            "total": len(self.scraped_data),
            "by_organization": {},
            "by_difficulty": {},
            "by_grade_level": {},
            "by_funding_type": {}
        }
        
        for scholarship in self.scraped_data:
            # Organization stats
            org = scholarship.get('organization', 'Unknown')
            stats["by_organization"][org] = stats["by_organization"].get(org, 0) + 1
            
            # Difficulty stats
            difficulty = scholarship.get('difficulty', 'Unknown')
            stats["by_difficulty"][difficulty] = stats["by_difficulty"].get(difficulty, 0) + 1
            
            # Grade level stats
            grade_levels = scholarship.get('eligibility', {}).get('gradeLevels', [])
            for grade in grade_levels:
                stats["by_grade_level"][grade] = stats["by_grade_level"].get(grade, 0) + 1
            
            # Funding type stats
            funding_types = scholarship.get('eligibility', {}).get('fundingTypes', [])
            for funding_type in funding_types:
                stats["by_funding_type"][funding_type] = stats["by_funding_type"].get(funding_type, 0) + 1
        
        return stats

def main():
    """Main function to run scraping"""
    manager = ScraperManager()
    
    # Run scraping
    scholarships = manager.run_all_scrapers()
    
    # Save to JSON
    filename = manager.save_to_json()
    
    # Print stats
    stats = manager.get_scraping_stats()
    print(f"\nScraping Statistics:")
    print(f"Total scholarships: {stats['total']}")
    print(f"Organizations: {len(stats['by_organization'])}")
    print(f"Difficulty levels: {stats['by_difficulty']}")
    
    return scholarships

if __name__ == "__main__":
    main()
