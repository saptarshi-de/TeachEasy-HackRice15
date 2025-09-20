from .base_scraper import BaseScraper
import re
from datetime import datetime
from typing import List, Dict

class EducationGrantScraper(BaseScraper):
    """Scraper for education grant websites"""
    
    def __init__(self):
        super().__init__()
        self.base_urls = [
            "https://www.grants.gov",
            "https://www.ed.gov/fund",
            "https://www.nsf.gov/funding",
            "https://www.donorschoose.org",
            "https://www.adoptaclassroom.org",
        ]
    
    def scrape_scholarships(self) -> List[Dict]:
        """Scrape education grants and scholarships"""
        scholarships = []
        
        # For now, we'll create realistic sample data based on real patterns
        # In production, you'd implement actual scraping for each site
        
        sample_grants = [
            {
                "title": "STEM Innovation Grant for K-12 Teachers",
                "description": "Funding for innovative STEM projects in K-12 classrooms. Supports hands-on learning, technology integration, and student engagement in science, technology, engineering, and mathematics.",
                "organization": "National Science Foundation",
                "website": "https://www.nsf.gov/funding",
                "amount_text": "$5,000 - $25,000",
                "deadline_text": "December 31, 2024",
                "grade_levels": "K-12",
                "subjects": "Science, Mathematics, Computer Science",
                "funding_types": "Technology Equipment, STEM Materials, Classroom Supplies",
                "requirements": "Must be a certified teacher with at least 2 years of experience. School must be public or charter.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Budget Proposal, School Information, Essay",
                "contact_email": "stem-grants@nsf.gov",
                "contact_phone": "(703) 292-5111",
                "tags": ["STEM", "Innovation", "Technology", "K-12"],
                "difficulty": "Medium"
            },
            {
                "title": "Rural Education Enhancement Fund",
                "description": "Grants specifically for teachers in rural school districts to improve educational resources and student outcomes. Focus on closing the rural-urban education gap.",
                "organization": "Rural Education Foundation",
                "website": "https://www.ruraleducation.org",
                "amount_text": "$2,000 - $15,000",
                "deadline_text": "November 15, 2024",
                "grade_levels": "Pre-K-12",
                "subjects": "Any",
                "funding_types": "Classroom Supplies, Books and Materials, Technology Equipment, Professional Development",
                "requirements": "Must teach in a school district with fewer than 10,000 students. Priority given to high-need schools.",
                "application_method": "Online",
                "documents_required": "Resume/CV, School Information, Budget Proposal",
                "contact_email": "grants@ruraleducation.org",
                "contact_phone": "(555) 123-4567",
                "tags": ["Rural", "Equity", "Resources", "Community"],
                "difficulty": "Easy"
            },
            {
                "title": "Arts Integration Professional Development Grant",
                "description": "Funding for teachers to attend professional development workshops focused on integrating arts into core curriculum subjects.",
                "organization": "Arts Education Partnership",
                "website": "https://www.artsedpartnership.org",
                "amount_text": "$1,000 - $5,000",
                "deadline_text": "October 30, 2024",
                "grade_levels": "K-8",
                "subjects": "Art, Music, English/Language Arts, Mathematics, Science",
                "funding_types": "Professional Development, Field Trips, Special Programs",
                "requirements": "Must be a current classroom teacher. Preference for teachers in Title I schools.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Cover Letter, Recommendation Letters",
                "contact_email": "grants@artsedpartnership.org",
                "contact_phone": "(202) 326-8699",
                "tags": ["Arts", "Professional Development", "Integration", "Creative"],
                "difficulty": "Easy"
            }
        ]
        
        for grant in sample_grants:
            scholarship = self.process_grant_data(grant)
            if scholarship:
                scholarships.append(scholarship)
        
        return scholarships
    
    def process_grant_data(self, grant_data: Dict) -> Dict:
        """Process raw grant data into our standardized format"""
        try:
            # Extract amounts
            min_amount, max_amount = self.extract_amount(grant_data["amount_text"])
            
            # Extract deadline
            deadline = self.extract_deadline(grant_data["deadline_text"])
            if not deadline:
                deadline = datetime(2024, 12, 31)  # Default deadline
            
            # Normalize grade levels
            grade_levels = self.normalize_grade_levels(grant_data["grade_levels"])
            
            # Normalize subjects
            subjects = self.normalize_subjects(grant_data["subjects"])
            
            # Normalize funding types
            funding_types = self.normalize_funding_types(grant_data["funding_types"])
            
            # Process documents required
            docs = grant_data["documents_required"]
            if isinstance(docs, str):
                docs = [doc.strip() for doc in docs.split(",")]
            elif not isinstance(docs, list):
                docs = []
            
            return {
                "title": self.clean_text(grant_data["title"]),
                "description": self.clean_text(grant_data["description"]),
                "organization": self.clean_text(grant_data["organization"]),
                "website": grant_data["website"],
                "amount": {
                    "min": int(min_amount),
                    "max": int(max_amount),
                    "currency": "USD"
                },
                "eligibility": {
                    "gradeLevels": grade_levels,
                    "subjects": subjects,
                    "regions": ["National"],  # Default to national
                    "fundingTypes": funding_types,
                    "requirements": self.clean_text(grant_data["requirements"])
                },
                "application": {
                    "deadline": deadline,
                    "applicationUrl": grant_data["website"],
                    "applicationMethod": grant_data["application_method"],
                    "documentsRequired": docs,
                    "isRecurring": True,
                    "nextDeadline": deadline.replace(year=deadline.year + 1) if deadline else None
                },
                "contact": {
                    "email": grant_data["contact_email"],
                    "phone": grant_data["contact_phone"]
                },
                "tags": [tag.strip() for tag in grant_data["tags"].split(",")],
                "difficulty": grant_data["difficulty"],
                "popularity": 75,  # Default popularity
                "isActive": True,
                "isVerified": True,
                "viewCount": 0,
                "bookmarkCount": 0
            }
        except Exception as e:
            print(f"Error processing grant data: {e}")
            return None
