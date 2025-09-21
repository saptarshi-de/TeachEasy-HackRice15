import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import json
import time
from fake_useragent import UserAgent
import logging

class BaseDiscountScraper:
    """Base class for discount scrapers following software design principles"""
    
    def __init__(self, name, base_url):
        self.name = name
        self.base_url = base_url
        self.session = requests.Session()
        self.ua = UserAgent()
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def normalize_discount_data(self, raw_discount):
        """Normalize scraped discount data to our schema"""
        try:
            # Parse dates
            valid_from = self.parse_date(raw_discount.get('valid_from', 'now'))
            valid_until = self.parse_date(raw_discount.get('valid_until', '30 days'))
            
            # Normalize discount value
            discount_value = self.normalize_discount_value(raw_discount.get('discount_value', ''))
            
            # Determine status
            status = self.determine_discount_status(valid_from, valid_until)
            
            normalized = {
                'title': raw_discount.get('title', '').strip(),
                'description': raw_discount.get('description', '').strip(),
                'company': raw_discount.get('company', '').strip(),
                'category': self.normalize_category(raw_discount.get('category', 'Other')),
                'discountType': self.normalize_discount_type(raw_discount.get('discount_type', 'Special Offer')),
                'discountValue': discount_value,
                'originalPrice': raw_discount.get('original_price', ''),
                'discountedPrice': raw_discount.get('discounted_price', ''),
                'website': raw_discount.get('website', self.base_url),
                'promoCode': raw_discount.get('promo_code', ''),
                'validFrom': valid_from,
                'validUntil': valid_until,
                'requirements': {
                    'teacherId': raw_discount.get('requires_teacher_id', False),
                    'membership': raw_discount.get('membership_required', 'None'),
                    'minimumSpend': raw_discount.get('minimum_spend', ''),
                    'other': raw_discount.get('other_requirements', '')
                },
                'source': self.name,
                'status': status,
                'isRecurring': raw_discount.get('is_recurring', False),
                'tags': self.normalize_tags(raw_discount.get('tags', [])),
                'imageUrl': raw_discount.get('image_url', ''),
                'featured': raw_discount.get('featured', False),
                'popularity': raw_discount.get('popularity', 0)
            }
            
            return normalized
            
        except Exception as e:
            self.logger.error(f"Error normalizing discount data: {e}")
            return None
    
    def parse_date(self, date_str):
        """Parse various date formats"""
        if not date_str or date_str == 'now':
            return datetime.now()
        
        try:
            # Handle relative dates
            if 'day' in date_str.lower():
                days = int(re.search(r'\d+', date_str).group())
                if 'ago' in date_str.lower():
                    return datetime.now() - timedelta(days=days)
                else:
                    return datetime.now() + timedelta(days=days)
            
            # Handle absolute dates
            formats = [
                '%Y-%m-%d',
                '%m/%d/%Y',
                '%m-%d-%Y',
                '%B %d, %Y',
                '%b %d, %Y',
                '%d %B %Y',
                '%d %b %Y'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
            
            # Default to 30 days from now
            return datetime.now() + timedelta(days=30)
            
        except Exception as e:
            self.logger.error(f"Error parsing date '{date_str}': {e}")
            return datetime.now() + timedelta(days=30)
    
    def normalize_discount_value(self, value_str):
        """Normalize discount value format"""
        if not value_str:
            return 'Special Offer'
        
        value_str = value_str.strip()
        
        # Extract percentage
        if '%' in value_str:
            return value_str
        
        # Extract dollar amount
        dollar_match = re.search(r'\$(\d+(?:\.\d{2})?)', value_str)
        if dollar_match:
            return f"${dollar_match.group(1)} off"
        
        # Extract "buy one get one" patterns
        if re.search(r'buy.*get.*one', value_str.lower()):
            return 'Buy One Get One'
        
        # Extract "free shipping"
        if 'free shipping' in value_str.lower():
            return 'Free Shipping'
        
        return value_str
    
    def normalize_category(self, category):
        """Normalize category to our enum values"""
        category_map = {
            'tech': 'Technology',
            'technology': 'Technology',
            'travel': 'Travel',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'health': 'Health & Wellness',
            'wellness': 'Health & Wellness',
            'education': 'Education',
            'books': 'Books & Media',
            'media': 'Books & Media',
            'food': 'Food & Dining',
            'dining': 'Food & Dining',
            'insurance': 'Insurance',
            'financial': 'Financial Services',
            'finance': 'Financial Services'
        }
        
        category_lower = category.lower().strip()
        return category_map.get(category_lower, 'Other')
    
    def normalize_discount_type(self, discount_type):
        """Normalize discount type to our enum values"""
        type_map = {
            'percentage': 'Percentage',
            'percent': 'Percentage',
            '%': 'Percentage',
            'fixed': 'Fixed Amount',
            'dollar': 'Fixed Amount',
            'free shipping': 'Free Shipping',
            'bogo': 'Buy One Get One',
            'buy one get one': 'Buy One Get One',
            'special': 'Special Offer',
            'membership': 'Membership Benefit'
        }
        
        type_lower = discount_type.lower().strip()
        return type_map.get(type_lower, 'Special Offer')
    
    def normalize_tags(self, tags):
        """Normalize tags to list format"""
        if isinstance(tags, str):
            return [tag.strip() for tag in tags.split(',') if tag.strip()]
        elif isinstance(tags, list):
            return [tag.strip() for tag in tags if tag.strip()]
        return []
    
    def determine_discount_status(self, valid_from, valid_until):
        """Determine discount status based on dates"""
        now = datetime.now()
        
        if valid_until < now:
            return 'Expired'
        elif valid_from > now:
            return 'Coming Soon'
        else:
            return 'Active'
    
    def scrape_discounts(self):
        """Main method to scrape discounts - to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement scrape_discounts method")
    
    def save_discounts(self, discounts, filename=None):
        """Save scraped discounts to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"discounts_{self.name.lower().replace(' ', '_')}_{timestamp}.json"
        
        filepath = f"data/{filename}"
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(discounts, f, indent=2, default=str)
            
            self.logger.info(f"Saved {len(discounts)} discounts to {filepath}")
            return filepath
            
        except Exception as e:
            self.logger.error(f"Error saving discounts: {e}")
            return None
