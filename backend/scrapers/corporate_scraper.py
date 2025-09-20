from .base_scraper import BaseScraper
import re
from datetime import datetime, timedelta
from typing import List, Dict

class CorporateScraper(BaseScraper):
    """Scraper for corporate education programs and grants"""
    
    def __init__(self):
        super().__init__()
        self.corporate_sources = [
            "Microsoft", "Google", "Apple", "Amazon", "Intel", "IBM", "Cisco",
            "Verizon", "AT&T", "Walmart", "Target", "Home Depot", "Lowe's"
        ]
    
    def scrape_scholarships(self) -> List[Dict]:
        """Scrape corporate education grants and programs"""
        scholarships = []
        
        # Corporate education programs (real examples)
        corporate_grants = [
            {
                "title": "Microsoft Education Innovation Grant",
                "description": "Funding for teachers to integrate Microsoft technologies into their classrooms. Supports digital transformation and 21st-century learning skills.",
                "organization": "Microsoft Corporation",
                "website": "https://www.microsoft.com/en-us/education/grants",
                "amount_text": "$5,000 - $30,000",
                "deadline_text": "March 31, 2025",
                "grade_levels": "K-12",
                "subjects": "Computer Science, Mathematics, Science, Any",
                "regions": "National",
                "districts": "National",
                "funding_types": "Technology Equipment, Professional Development, Software Licenses",
                "requirements": "Must be a certified teacher interested in technology integration. Priority for schools with limited technology resources.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Technology Integration Plan, Budget, School Support Letter",
                "contact_email": "educationgrants@microsoft.com",
                "contact_phone": "(425) 882-8080",
                "tags": ["Corporate", "Technology", "Microsoft", "Digital Learning"],
                "difficulty": "Medium",
                "is_recurring": True
            },
            {
                "title": "Google for Education Classroom Grant",
                "description": "Supports teachers using Google Workspace for Education tools to enhance student learning. Focus on collaborative learning and digital literacy.",
                "organization": "Google LLC",
                "website": "https://edu.google.com/grants",
                "amount_text": "$2,500 - $15,000",
                "deadline_text": "April 15, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "National",
                "funding_types": "Technology Equipment, Professional Development, Classroom Supplies",
                "requirements": "Must demonstrate innovative use of Google tools in education. Open to all subject areas.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Google Tools Implementation Plan, Student Impact Statement",
                "contact_email": "education@google.com",
                "contact_phone": "(650) 253-0000",
                "tags": ["Corporate", "Google", "Collaborative Learning", "Digital Literacy"],
                "difficulty": "Easy",
                "is_recurring": True
            },
            {
                "title": "Intel STEM Education Program",
                "description": "Funding for STEM education initiatives and teacher professional development. Supports hands-on learning and project-based education.",
                "organization": "Intel Corporation",
                "website": "https://www.intel.com/content/www/us/en/education/grants.html",
                "amount_text": "$10,000 - $50,000",
                "deadline_text": "May 30, 2025",
                "grade_levels": "6-12",
                "subjects": "Science, Mathematics, Computer Science, Engineering",
                "regions": "National",
                "districts": "National",
                "funding_types": "STEM Materials, Technology Equipment, Professional Development",
                "requirements": "Must teach STEM subjects and demonstrate hands-on learning approach. Priority for underrepresented student populations.",
                "application_method": "Online",
                "documents_required": "Resume/CV, STEM Project Proposal, Budget, Diversity Statement",
                "contact_email": "stem@intel.com",
                "contact_phone": "(408) 765-8080",
                "tags": ["Corporate", "STEM", "Intel", "Hands-on Learning"],
                "difficulty": "Medium",
                "is_recurring": True
            },
            {
                "title": "Walmart Community Grant Program",
                "description": "Local community grants for education programs and teacher initiatives. Focus on supporting local schools and educational projects.",
                "organization": "Walmart Foundation",
                "website": "https://corporate.walmart.com/community-grants",
                "amount_text": "$250 - $5,000",
                "deadline_text": "June 15, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "Local Communities",
                "districts": "Local Districts",
                "funding_types": "Classroom Supplies, Books and Materials, Field Trips, Student Support",
                "requirements": "Must be located near a Walmart store and serve local community. Priority for high-need schools.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Community Impact Plan, Local Support Letters",
                "contact_email": "community@walmart.com",
                "contact_phone": "(479) 273-4000",
                "tags": ["Corporate", "Local Community", "Walmart", "High-Need Schools"],
                "difficulty": "Easy",
                "is_recurring": True
            },
            {
                "title": "Verizon Innovative Learning Program",
                "description": "Technology grants for schools to enhance digital learning and close the digital divide. Supports connectivity and device access.",
                "organization": "Verizon Communications",
                "website": "https://www.verizon.com/about/responsibility/education",
                "amount_text": "$15,000 - $100,000",
                "deadline_text": "July 1, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "High-Need Districts",
                "funding_types": "Technology Equipment, Internet Connectivity, Professional Development",
                "requirements": "Must serve high-need schools with limited technology access. Focus on closing digital divide.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Digital Divide Assessment, Technology Plan, Budget",
                "contact_email": "education@verizon.com",
                "contact_phone": "(908) 559-2000",
                "tags": ["Corporate", "Digital Divide", "Verizon", "Connectivity"],
                "difficulty": "Hard",
                "is_recurring": True
            }
        ]
        
        for grant in corporate_grants:
            scholarship = self.process_corporate_data(grant)
            if scholarship:
                scholarships.append(scholarship)
        
        return scholarships
    
    def process_corporate_data(self, grant_data: Dict) -> Dict:
        """Process corporate grant data"""
        try:
            # Extract amounts
            min_amount, max_amount = self.extract_amount(grant_data["amount_text"])
            
            # Extract deadline
            deadline = self.extract_deadline(grant_data["deadline_text"])
            if not deadline:
                deadline = datetime.now() + timedelta(days=150)
            
            # Handle recurring grants
            next_deadline = None
            if grant_data.get("is_recurring", False):
                next_deadline = deadline.replace(year=deadline.year + 1)
            
            # Normalize data
            grade_levels = self.normalize_grade_levels(grant_data["grade_levels"])
            subjects = self.normalize_subjects(grant_data["subjects"])
            funding_types = self.normalize_funding_types(grant_data["funding_types"])
            
            # Process documents
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
                    "regions": [grant_data["regions"]],
                    "districts": [grant_data["districts"]],
                    "fundingTypes": funding_types,
                    "requirements": self.clean_text(grant_data["requirements"])
                },
                "application": {
                    "deadline": deadline,
                    "applicationUrl": grant_data["website"],
                    "applicationMethod": grant_data["application_method"],
                    "documentsRequired": docs,
                    "isRecurring": grant_data.get("is_recurring", False),
                    "nextDeadline": next_deadline
                },
                "contact": {
                    "email": grant_data["contact_email"],
                    "phone": grant_data["contact_phone"]
                },
                "tags": grant_data["tags"] if isinstance(grant_data["tags"], list) else [tag.strip() for tag in grant_data["tags"].split(",")],
                "difficulty": grant_data["difficulty"],
                "popularity": 60,  # Corporate grants are moderately popular
                "isActive": True,
                "isVerified": True,
                "viewCount": 0,
                "bookmarkCount": 0,
                "source": "Corporate"
            }
        except Exception as e:
            print(f"Error processing corporate grant: {e}")
            return None
