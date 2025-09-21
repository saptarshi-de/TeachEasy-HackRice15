#!/usr/bin/env python3
"""
Comprehensive scraper for teacher grants and scholarships
Scrapes from multiple sources and categorizes opportunities
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime, timedelta
from fake_useragent import UserAgent
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GrantsScholarshipsScraper:
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
    
    def extract_amount(self, text):
        """Extract monetary amounts from text"""
        if not text:
            return {"min": 0, "max": 0, "currency": "USD"}
        
        # Look for dollar amounts
        amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
        if amounts:
            # Clean and convert amounts
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
            # Default to 6 months from now
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
        """Scrape grants from We Are Teachers website"""
        logger.info("Scraping grants from We Are Teachers...")
        url = "https://www.weareteachers.com/education-grants/"
        
        response = self.get_page(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        grants = []
        
        # Find all grant sections
        grant_sections = soup.find_all(['h3', 'h4'], string=re.compile(r'^[A-Z]'))
        
        for section in grant_sections:
            try:
                # Get the grant name
                grant_name = section.get_text().strip()
                if not grant_name or len(grant_name) < 5:
                    continue
                
                # Find the parent container
                container = section.find_parent(['div', 'section', 'article'])
                if not container:
                    continue
                
                # Extract description
                description = ""
                desc_elem = container.find_next(['p', 'div'])
                if desc_elem:
                    description = desc_elem.get_text().strip()
                
                # Extract award amount
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
                
                grant = {
                    "title": grant_name,
                    "description": description[:500] if description else f"Education grant opportunity: {grant_name}",
                    "organization": "Various Organizations",
                    "website": url,
                    "amount": self.extract_amount(award_text),
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
                        "documentsRequired": ["Application Form", "Project Proposal"],
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
                    "type": "grant"
                }
                
                grants.append(grant)
                
            except Exception as e:
                logger.error(f"Error processing grant section: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from We Are Teachers")
        return grants
    
    def scrape_texas_grants(self):
        """Scrape grants from Texas GrantWatch"""
        logger.info("Scraping grants from Texas GrantWatch...")
        url = "https://texas.grantwatch.com/cat/42/teachers-grants.html"
        
        response = self.get_page(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        grants = []
        
        # Find grant listings
        grant_listings = soup.find_all(['div', 'article'], class_=re.compile(r'grant|listing|item'))
        
        for listing in grant_listings:
            try:
                # Extract grant title
                title_elem = listing.find(['h1', 'h2', 'h3', 'h4', 'a'])
                if not title_elem:
                    continue
                
                title = title_elem.get_text().strip()
                if not title or len(title) < 5:
                    continue
                
                # Extract description
                description = ""
                desc_elem = listing.find(['p', 'div'])
                if desc_elem:
                    description = desc_elem.get_text().strip()
                
                # Extract amount
                amount_text = ""
                amount_elem = listing.find(string=re.compile(r'\$[\d,]+'))
                if amount_elem:
                    amount_text = amount_elem.strip()
                
                grant = {
                    "title": title,
                    "description": description[:500] if description else f"Texas teacher grant opportunity: {title}",
                    "organization": "Texas Organizations",
                    "website": url,
                    "amount": self.extract_amount(amount_text),
                    "eligibility": {
                        "gradeLevels": ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                        "subjects": ["Any"],
                        "regions": ["Texas"],
                        "fundingTypes": ["Classroom Supplies", "Technology Equipment", "Professional Development"],
                        "requirements": "Must be a Texas teacher or educational organization"
                    },
                    "application": {
                        "deadline": self.parse_deadline(""),
                        "applicationUrl": url,
                        "applicationMethod": "Online",
                        "documentsRequired": ["Application Form", "Project Proposal"],
                        "isRecurring": True,
                        "nextDeadline": self.parse_deadline("")
                    },
                    "contact": {
                        "email": "info@grantwatch.com"
                    },
                    "tags": ["grant", "texas", "education", "teacher"],
                    "difficulty": "Medium",
                    "popularity": 70,
                    "isActive": True,
                    "isVerified": True,
                    "source": "Texas GrantWatch",
                    "type": "grant"
                }
                
                grants.append(grant)
                
            except Exception as e:
                logger.error(f"Error processing Texas grant listing: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from Texas GrantWatch")
        return grants
    
    def scrape_teacher_scholarships(self):
        """Scrape scholarships from Teachers of Tomorrow"""
        logger.info("Scraping scholarships from Teachers of Tomorrow...")
        url = "https://www.teachersoftomorrow.org/blog/insights/teacher-scholarships-texas/"
        
        response = self.get_page(url)
        if not response:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        scholarships = []
        
        # Find scholarship sections
        scholarship_sections = soup.find_all(['h2', 'h3', 'h4'], string=re.compile(r'scholarship|grant|award', re.I))
        
        for section in scholarship_sections:
            try:
                # Get the scholarship name
                scholarship_name = section.get_text().strip()
                if not scholarship_name or len(scholarship_name) < 5:
                    continue
                
                # Find the parent container
                container = section.find_parent(['div', 'section', 'article'])
                if not container:
                    continue
                
                # Extract description
                description = ""
                desc_elem = container.find_next(['p', 'div'])
                if desc_elem:
                    description = desc_elem.get_text().strip()
                
                # Extract amount
                amount_text = ""
                amount_elem = container.find(string=re.compile(r'\$[\d,]+'))
                if amount_elem:
                    amount_text = amount_elem.strip()
                
                # Extract deadline
                deadline_text = ""
                deadline_elem = container.find(string=re.compile(r'(deadline|due|closes)', re.I))
                if deadline_elem:
                    deadline_text = deadline_elem.strip()
                
                scholarship = {
                    "title": scholarship_name,
                    "description": description[:500] if description else f"Teacher scholarship opportunity: {scholarship_name}",
                    "organization": "Teachers of Tomorrow",
                    "website": url,
                    "amount": self.extract_amount(amount_text),
                    "eligibility": {
                        "gradeLevels": ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                        "subjects": ["Any"],
                        "regions": ["Texas", "National"],
                        "fundingTypes": ["Professional Development", "Education Programs"],
                        "requirements": "Must be pursuing or planning to pursue a teaching career"
                    },
                    "application": {
                        "deadline": self.parse_deadline(deadline_text),
                        "applicationUrl": url,
                        "applicationMethod": "Online",
                        "documentsRequired": ["Application Form", "Transcripts", "Recommendation Letters"],
                        "isRecurring": True,
                        "nextDeadline": self.parse_deadline(deadline_text)
                    },
                    "contact": {
                        "email": "info@teachersoftomorrow.org"
                    },
                    "tags": ["scholarship", "education", "teacher", "texas"],
                    "difficulty": "Medium",
                    "popularity": 80,
                    "isActive": True,
                    "isVerified": True,
                    "source": "Teachers of Tomorrow",
                    "type": "scholarship"
                }
                
                scholarships.append(scholarship)
                
            except Exception as e:
                logger.error(f"Error processing scholarship section: {e}")
                continue
        
        logger.info(f"Found {len(scholarships)} scholarships from Teachers of Tomorrow")
        return scholarships
    
    def scrape_all(self):
        """Scrape all sources and return combined results"""
        logger.info("Starting comprehensive scraping of grants and scholarships...")
        
        all_opportunities = []
        
        # Scrape grants
        try:
            weareteachers_grants = self.scrape_weareteachers_grants()
            all_opportunities.extend(weareteachers_grants)
        except Exception as e:
            logger.error(f"Error scraping We Are Teachers: {e}")
        
        try:
            texas_grants = self.scrape_texas_grants()
            all_opportunities.extend(texas_grants)
        except Exception as e:
            logger.error(f"Error scraping Texas GrantWatch: {e}")
        
        # Scrape scholarships
        try:
            teacher_scholarships = self.scrape_teacher_scholarships()
            all_opportunities.extend(teacher_scholarships)
        except Exception as e:
            logger.error(f"Error scraping Teachers of Tomorrow: {e}")
        
        logger.info(f"Total opportunities scraped: {len(all_opportunities)}")
        return all_opportunities
    
    def save_to_file(self, opportunities, filename=None):
        """Save scraped opportunities to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"scraped_opportunities_{timestamp}.json"
        
        filepath = f"data/{filename}"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(opportunities, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(opportunities)} opportunities to {filepath}")
        return filepath

if __name__ == "__main__":
    scraper = GrantsScholarshipsScraper()
    opportunities = scraper.scrape_all()
    
    if opportunities:
        filepath = scraper.save_to_file(opportunities)
        print(f"Scraping completed! Found {len(opportunities)} opportunities.")
        print(f"Data saved to: {filepath}")
        
        # Print summary
        grants = [op for op in opportunities if op.get('type') == 'grant']
        scholarships = [op for op in opportunities if op.get('type') == 'scholarship']
        
        print(f"\nSummary:")
        print(f"Grants: {len(grants)}")
        print(f"Scholarships: {len(scholarships)}")
    else:
        print("No opportunities found.")
