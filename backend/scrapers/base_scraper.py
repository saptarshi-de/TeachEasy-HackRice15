import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import time
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseScraper:
    """Base class for all scholarship scrapers"""
    
    def __init__(self):
        self.ua = UserAgent()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
    def get_page(self, url: str, delay: float = 1.0) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        try:
            time.sleep(delay)  # Be respectful
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def extract_amount(self, text: str) -> tuple:
        """Extract min and max amounts from text"""
        # Remove common words and clean text
        text = re.sub(r'[^\d,.-]', ' ', text.lower())
        
        # Look for patterns like "$1,000 - $5,000" or "up to $10,000"
        amount_patterns = [
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'up\s+to\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*maximum',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*minimum',
        ]
        
        for pattern in amount_patterns:
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
    
    def extract_deadline(self, text: str) -> Optional[datetime]:
        """Extract deadline from text"""
        # Common date patterns
        date_patterns = [
            r'(\d{1,2})/(\d{1,2})/(\d{4})',
            r'(\d{1,2})-(\d{1,2})-(\d{4})',
            r'(\w+)\s+(\d{1,2}),?\s+(\d{4})',
            r'(\d{1,2})\s+(\w+)\s+(\d{4})',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    if '/' in text or '-' in text:
                        month, day, year = match.groups()
                        return datetime(int(year), int(month), int(day))
                    else:
                        # Handle month names
                        month_name, day, year = match.groups()
                        month_map = {
                            'january': 1, 'february': 2, 'march': 3, 'april': 4,
                            'may': 5, 'june': 6, 'july': 7, 'august': 8,
                            'september': 9, 'october': 10, 'november': 11, 'december': 12
                        }
                        month_num = month_map.get(month_name.lower())
                        if month_num:
                            return datetime(int(year), month_num, int(day))
                except ValueError:
                    continue
        
        return None
    
    def normalize_grade_levels(self, text: str) -> List[str]:
        """Normalize grade level text to our enum values"""
        text = text.lower()
        grade_mapping = {
            'pre-k': 'Pre-K', 'prek': 'Pre-K', 'pre-kindergarten': 'Pre-K',
            'kindergarten': 'K', 'k': 'K',
            'elementary': ['K', '1', '2', '3', '4', '5'],
            'middle school': ['6', '7', '8'],
            'high school': ['9', '10', '11', '12'],
            'secondary': ['9', '10', '11', '12'],
            'k-12': ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            'k-8': ['K', '1', '2', '3', '4', '5', '6', '7', '8'],
            '6-12': ['6', '7', '8', '9', '10', '11', '12'],
        }
        
        grades = []
        for key, value in grade_mapping.items():
            if key in text:
                if isinstance(value, list):
                    grades.extend(value)
                else:
                    grades.append(value)
        
        # Also check for individual grade numbers
        for i in range(1, 13):
            if f'grade {i}' in text or f'grade {i}' in text:
                grades.append(str(i))
        
        return list(set(grades)) if grades else ['Any']
    
    def normalize_subjects(self, text: str) -> List[str]:
        """Normalize subject text to our enum values"""
        text = text.lower()
        subject_mapping = {
            'math': 'Mathematics', 'mathematics': 'Mathematics',
            'science': 'Science', 'stem': 'Science',
            'english': 'English/Language Arts', 'language arts': 'English/Language Arts',
            'reading': 'Reading', 'writing': 'Writing',
            'social studies': 'Social Studies', 'history': 'History',
            'art': 'Art', 'arts': 'Art',
            'music': 'Music',
            'pe': 'Physical Education', 'physical education': 'Physical Education',
            'foreign language': 'Foreign Language', 'language': 'Foreign Language',
            'computer science': 'Computer Science', 'coding': 'Computer Science',
            'special education': 'Special Education', 'special ed': 'Special Education',
            'esl': 'ESL/ELL', 'ell': 'ESL/ELL',
        }
        
        subjects = []
        for key, value in subject_mapping.items():
            if key in text:
                subjects.append(value)
        
        return list(set(subjects)) if subjects else ['Any']
    
    def normalize_funding_types(self, text: str) -> List[str]:
        """Normalize funding type text to our enum values"""
        text = text.lower()
        funding_mapping = {
            'supplies': 'Classroom Supplies', 'classroom supplies': 'Classroom Supplies',
            'technology': 'Technology Equipment', 'tech': 'Technology Equipment',
            'books': 'Books and Materials', 'materials': 'Books and Materials',
            'professional development': 'Professional Development', 'pd': 'Professional Development',
            'field trips': 'Field Trips', 'trips': 'Field Trips',
            'programs': 'Special Programs', 'special programs': 'Special Programs',
            'student support': 'Student Support', 'support': 'Student Support',
            'furniture': 'Classroom Furniture', 'classroom furniture': 'Classroom Furniture',
            'stem materials': 'STEM Materials', 'stem': 'STEM Materials',
        }
        
        funding_types = []
        for key, value in funding_mapping.items():
            if key in text:
                funding_types.append(value)
        
        return list(set(funding_types)) if funding_types else ['General']
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove HTML tags if any
        text = re.sub(r'<[^>]+>', '', text)
        
        return text
    
    def scrape_scholarships(self) -> List[Dict]:
        """Override this method in subclasses"""
        raise NotImplementedError("Subclasses must implement scrape_scholarships method")
