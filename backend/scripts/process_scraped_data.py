#!/usr/bin/env python3
"""
Data processing pipeline for scraped scholarship data
Converts scraped data to MongoDB format and handles normalization
"""

import sys
import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from scrapers.ai_matcher import AIMatcher
from scrapers.scraper_manager import ScraperManager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataProcessor:
    """Processes and normalizes scraped scholarship data"""
    
    def __init__(self):
        self.ai_matcher = AIMatcher()
        self.processed_data = []
        
    def normalize_scholarship_data(self, raw_data: List[Dict]) -> List[Dict]:
        """Normalize scraped data to match our database schema"""
        normalized = []
        
        for item in raw_data:
            try:
                normalized_item = self.process_single_scholarship(item)
                if normalized_item:
                    normalized.append(normalized_item)
            except Exception as e:
                logger.error(f"Error processing scholarship {item.get('title', 'Unknown')}: {e}")
                continue
        
        logger.info(f"Normalized {len(normalized)} out of {len(raw_data)} scholarships")
        return normalized
    
    def process_single_scholarship(self, item: Dict) -> Dict:
        """Process a single scholarship item"""
        # Extract and clean basic information
        title = self.clean_text(item.get('title', ''))
        if not title:
            return None
            
        description = self.clean_text(item.get('description', ''))
        organization = self.clean_text(item.get('organization', ''))
        
        # Process amount
        amount = self.process_amount(item.get('amount', {}))
        
        # Process eligibility
        eligibility = self.process_eligibility(item.get('eligibility', {}))
        
        # Process application details
        application = self.process_application(item.get('application', {}))
        
        # Process contact information
        contact = self.process_contact(item.get('contact', {}))
        
        # Process metadata
        tags = self.process_tags(item.get('tags', []))
        difficulty = item.get('difficulty', 'Medium')
        popularity = item.get('popularity', 50)
        
        return {
            'title': title,
            'description': description,
            'organization': organization,
            'website': item.get('website', ''),
            'amount': amount,
            'eligibility': eligibility,
            'application': application,
            'contact': contact,
            'tags': tags,
            'difficulty': difficulty,
            'popularity': popularity,
            'isActive': True,
            'isVerified': True,
            'viewCount': 0,
            'bookmarkCount': 0,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now(),
            'publishedAt': datetime.now()
        }
    
    def process_amount(self, amount_data: Dict) -> Dict:
        """Process amount information"""
        if isinstance(amount_data, dict):
            min_amt = amount_data.get('min', 0)
            max_amt = amount_data.get('max', 0)
            currency = amount_data.get('currency', 'USD')
        else:
            # Handle string amounts like "$1,000 - $5,000"
            min_amt, max_amt = self.extract_amount_from_text(str(amount_data))
            currency = 'USD'
        
        return {
            'min': int(min_amt),
            'max': int(max_amt),
            'currency': currency
        }
    
    def extract_amount_from_text(self, text: str) -> tuple:
        """Extract min and max amounts from text"""
        import re
        
        # Remove currency symbols and clean text
        text = re.sub(r'[^\d,.-]', ' ', text.lower())
        
        # Look for patterns like "1,000 - 5,000" or "up to 10,000"
        patterns = [
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'up\s+to\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*maximum',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                if len(match.groups()) == 2:
                    min_amt = float(match.group(1).replace(',', ''))
                    max_amt = float(match.group(2).replace(',', ''))
                    return (min_amt, max_amt)
                else:
                    amount = float(match.group(1).replace(',', ''))
                    if 'up to' in text or 'maximum' in text:
                        return (0, amount)
                    else:
                        return (amount, amount)
        
        return (0, 0)
    
    def process_eligibility(self, eligibility_data: Dict) -> Dict:
        """Process eligibility information"""
        return {
            'gradeLevels': self.normalize_list(eligibility_data.get('gradeLevels', [])),
            'subjects': self.normalize_list(eligibility_data.get('subjects', [])),
            'regions': self.normalize_list(eligibility_data.get('regions', ['National'])),
            'districts': self.normalize_list(eligibility_data.get('districts', ['National'])),
            'fundingTypes': self.normalize_list(eligibility_data.get('fundingTypes', ['General'])),
            'requirements': self.clean_text(eligibility_data.get('requirements', ''))
        }
    
    def process_application(self, application_data: Dict) -> Dict:
        """Process application information"""
        deadline = application_data.get('deadline')
        if isinstance(deadline, str):
            deadline = self.parse_date(deadline)
        elif deadline is None:
            deadline = datetime.now() + timedelta(days=30)  # Default 30 days from now
        
        return {
            'deadline': deadline,
            'applicationUrl': application_data.get('applicationUrl', ''),
            'applicationMethod': application_data.get('applicationMethod', 'Online'),
            'documentsRequired': self.normalize_list(application_data.get('documentsRequired', [])),
            'isRecurring': application_data.get('isRecurring', False),
            'nextDeadline': application_data.get('nextDeadline')
        }
    
    def process_contact(self, contact_data: Dict) -> Dict:
        """Process contact information"""
        return {
            'email': contact_data.get('email', ''),
            'phone': contact_data.get('phone', ''),
            'address': {
                'street': contact_data.get('address', {}).get('street', ''),
                'city': contact_data.get('address', {}).get('city', ''),
                'state': contact_data.get('address', {}).get('state', ''),
                'zipCode': contact_data.get('address', {}).get('zipCode', ''),
                'country': contact_data.get('address', {}).get('country', 'US')
            }
        }
    
    def process_tags(self, tags: List[str]) -> List[str]:
        """Process and clean tags"""
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',')]
        
        return [self.clean_text(tag) for tag in tags if tag.strip()]
    
    def normalize_list(self, items: List[str]) -> List[str]:
        """Normalize a list of items"""
        if isinstance(items, str):
            items = [item.strip() for item in items.split(',')]
        
        return [self.clean_text(item) for item in items if item.strip()]
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        import re
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove HTML tags if any
        text = re.sub(r'<[^>]+>', '', text)
        
        return text
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object"""
        from dateutil import parser
        
        try:
            return parser.parse(date_str)
        except:
            # Fallback to current date + 30 days
            return datetime.now() + timedelta(days=30)
    
    def save_processed_data(self, data: List[Dict], filename: str = None) -> str:
        """Save processed data to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"processed_scholarships_{timestamp}.json"
        
        filepath = os.path.join(os.path.dirname(__file__), '..', 'data', filename)
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"Saved {len(data)} processed scholarships to {filepath}")
        return filepath

def main():
    """Main processing function"""
    processor = DataProcessor()
    
    # Load scraped data
    manager = ScraperManager()
    
    # Check if we have existing scraped data
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    scraped_files = [f for f in os.listdir(data_dir) if f.startswith('scraped_scholarships_')]
    
    if scraped_files:
        # Use the most recent scraped file
        latest_file = max(scraped_files)
        raw_data = manager.load_from_json(latest_file)
        logger.info(f"Loaded {len(raw_data)} scholarships from {latest_file}")
    else:
        # Run scraping if no data exists
        logger.info("No scraped data found, running scrapers...")
        raw_data = manager.run_all_scrapers()
        manager.save_to_json()
    
    # Process the data
    logger.info("Processing scraped data...")
    processed_data = processor.normalize_scholarship_data(raw_data)
    
    # Save processed data
    filename = processor.save_processed_data(processed_data)
    
    # Print statistics
    logger.info(f"Processing complete!")
    logger.info(f"Raw data: {len(raw_data)} scholarships")
    logger.info(f"Processed data: {len(processed_data)} scholarships")
    logger.info(f"Saved to: {filename}")
    
    return processed_data

if __name__ == "__main__":
    main()
