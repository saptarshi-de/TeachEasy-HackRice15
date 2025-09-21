#!/usr/bin/env python3
"""
Improved scraper for We Are Teachers grants
Properly extracts individual grant information
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime, timedelta
from fake_useragent import UserAgent
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ImprovedWeAreTeachersScraper:
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
    
    def get_page(self, url, retries=3):
        """Fetch a webpage with retries and error handling"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                return response
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(2)
                else:
                    logger.error(f"Failed to fetch {url} after {retries} attempts")
                    return None
    
    def extract_amount_from_text(self, text):
        """Extract monetary amounts from text"""
        if not text:
            return {"min": 0, "max": 0, "currency": "USD"}
        
        # Look for dollar amounts
        amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
        if amounts:
            clean_amounts = []
            for amount in amounts:
                clean = re.sub(r'[$,]', '', amount)
                try:
                    clean_amounts.append(int(float(clean)))
                except:
                    continue
            
            if clean_amounts:
                return {
                    "min": min(clean_amounts),
                    "max": max(clean_amounts),
                    "currency": "USD"
                }
        
        # Look for "varies" or similar
        if any(word in text.lower() for word in ['varies', 'varies by', 'contact', 'tbd']):
            return {"min": 0, "max": 0, "currency": "USD", "note": "Amount varies"}
        
        return {"min": 0, "max": 0, "currency": "USD"}
    
    def parse_deadline(self, deadline_text):
        """Parse deadline text into a future date"""
        if not deadline_text:
            return (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
        
        deadline_text = deadline_text.lower().strip()
        
        # Handle "ongoing" or "rolling"
        if any(word in deadline_text for word in ['ongoing', 'rolling', 'continuous']):
            return (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d %H:%M:%S')
        
        # Handle specific dates
        date_patterns = [
            r'(\w+)\s+(\d{1,2}),\s+(\d{4})',  # "April 18, 2025"
            r'(\d{1,2})/(\d{1,2})/(\d{4})',   # "04/18/2025"
            r'(\d{4})-(\d{1,2})-(\d{1,2})',   # "2025-04-18"
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, deadline_text)
            if match:
                try:
                    if '/' in deadline_text:
                        month, day, year = match.groups()
                        date_obj = datetime(int(year), int(month), int(day))
                    elif '-' in deadline_text:
                        year, month, day = match.groups()
                        date_obj = datetime(int(year), int(month), int(day))
                    else:
                        month_name, day, year = match.groups()
                        month_num = datetime.strptime(month_name, '%B').month
                        date_obj = datetime(int(year), month_num, int(day))
                    
                    # If date is in the past, move to next year
                    if date_obj < datetime.now():
                        date_obj = date_obj.replace(year=date_obj.year + 1)
                    
                    return date_obj.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    continue
        
        # Default to 6 months from now if can't parse
        return (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
    
    def scrape_weareteachers_grants(self):
        """Scrape grants from We Are Teachers website with proper parsing"""
        logger.info("Scraping grants from We Are Teachers...")
        url = "https://www.weareteachers.com/education-grants/"
        
        response = self.get_page(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        grants = []
        
        # Find all grant sections - look for h3/h4 headings that contain grant names
        grant_headings = soup.find_all(['h3', 'h4'], string=re.compile(r'^[A-Z][^$]*$'))
        
        for heading in grant_headings:
            try:
                grant_name = heading.get_text().strip()
                if not grant_name or len(grant_name) < 5:
                    continue
                
                # Skip generic headings
                if any(skip in grant_name.lower() for skip in ['tips for', 'jump to', 'general education', 'professional development', 'steam education', 'literacy education', 'arts education', 'school grounds']):
                    continue
                
                # Find the parent container
                container = heading.find_parent(['div', 'section', 'article'])
                if not container:
                    continue
                
                # Extract description from the next paragraph
                description = ""
                desc_elem = container.find_next(['p', 'div'])
                if desc_elem:
                    desc_text = desc_elem.get_text().strip()
                    # Skip generic descriptions
                    if not any(skip in desc_text.lower() for skip in ['it\'s no secret', 'teachers spend money', 'looking for school funding']):
                        description = desc_text[:500]
                
                # Extract award amount from the container
                award_text = ""
                award_elem = container.find(string=re.compile(r'\$[\d,]+'))
                if award_elem:
                    award_text = award_elem.strip()
                
                # Extract deadline
                deadline_text = ""
                deadline_elem = container.find(string=re.compile(r'(deadline|due|closes)', re.I))
                if deadline_elem:
                    deadline_text = deadline_elem.strip()
                
                # Extract application requirements
                requirements = ""
                req_elem = container.find(string=re.compile(r'requirements|eligibility', re.I))
                if req_elem:
                    requirements = req_elem.strip()
                
                # Create grant object
                grant = {
                    "title": grant_name,
                    "description": description if description else f"Education grant opportunity: {grant_name}",
                    "organization": "Various Organizations",
                    "website": url,
                    "amount": self.extract_amount_from_text(award_text),
                    "eligibility": {
                        "gradeLevels": ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                        "subjects": ["Any"],
                        "regions": ["National"],
                        "fundingTypes": ["Classroom Supplies", "Technology Equipment", "Professional Development"],
                        "requirements": requirements[:200] if requirements else "See website for details"
                    },
                    "application": {
                        "deadline": self.parse_deadline(deadline_text),
                        "applicationUrl": url,
                        "applicationMethod": "Online",
                        "documentsRequired": ["Other"],
                        "isRecurring": True,
                        "nextDeadline": self.parse_deadline(deadline_text)
                    },
                    "contact": {
                        "email": "info@weareteachers.com"
                    },
                    "tags": ["grant", "education", "classroom", "teacher"],
                    "difficulty": "Medium",
                    "popularity": 75,
                    "isActive": True,
                    "isVerified": True,
                    "source": "We Are Teachers",
                    "type": "grant"  # These are grants, not scholarships
                }
                
                grants.append(grant)
                
            except Exception as e:
                logger.error(f"Error processing grant section: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from We Are Teachers")
        return grants

if __name__ == "__main__":
    scraper = ImprovedWeAreTeachersScraper()
    grants = scraper.scrape_weareteachers_grants()
    
    print(f"Found {len(grants)} grants:")
    for i, grant in enumerate(grants[:5]):
        print(f"{i+1}. {grant['title']}")
        print(f"   Amount: ${grant['amount']['min']} - ${grant['amount']['max']}")
        print(f"   Description: {grant['description'][:100]}...")
        print()
