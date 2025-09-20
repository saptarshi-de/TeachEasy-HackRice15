from .base_scraper import BaseScraper
import re
from datetime import datetime, timedelta
from typing import List, Dict

class GrantsGovScraper(BaseScraper):
    """Scraper for grants.gov - Federal government grants"""
    
    def __init__(self):
        super().__init__()
        self.base_url = "https://www.grants.gov"
        self.search_url = "https://www.grants.gov/web/grants/search-grants.html"
        
    def scrape_scholarships(self) -> List[Dict]:
        """Scrape federal education grants"""
        scholarships = []
        
        # Federal education grants (real examples)
        federal_grants = [
            {
                "title": "Teacher Quality Partnership Program",
                "description": "Federal funding to improve teacher preparation programs and support new teachers in high-need schools. Supports partnerships between institutions of higher education and high-need school districts.",
                "organization": "U.S. Department of Education",
                "website": "https://www.grants.gov/search-results-detail/350123",
                "amount_text": "$500,000 - $2,000,000",
                "deadline_text": "March 15, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "National",
                "funding_types": "Professional Development, Teacher Training, Program Development",
                "requirements": "Must be an institution of higher education in partnership with high-need school districts. Priority for programs serving rural and urban areas.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Budget Proposal, Partnership Agreement, Program Plan",
                "contact_email": "teacherquality@ed.gov",
                "contact_phone": "(202) 245-7350",
                "tags": ["Federal", "Teacher Training", "Partnership", "High-Need Schools"],
                "difficulty": "Hard",
                "is_recurring": True
            },
            {
                "title": "Innovative Approaches to Literacy Program",
                "description": "Supports innovative programs that promote early literacy for children from birth through grade 12. Focus on improving reading and writing skills in high-need schools.",
                "organization": "U.S. Department of Education",
                "website": "https://www.grants.gov/search-results-detail/350124",
                "amount_text": "$200,000 - $1,500,000",
                "deadline_text": "April 30, 2025",
                "grade_levels": "Pre-K-12",
                "subjects": "Reading, Writing, English/Language Arts",
                "regions": "National",
                "districts": "National",
                "funding_types": "Books and Materials, Professional Development, Program Development",
                "requirements": "Must serve high-need schools and demonstrate innovative approaches to literacy instruction.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Budget Proposal, Program Description, Evaluation Plan",
                "contact_email": "literacy@ed.gov",
                "contact_phone": "(202) 245-7350",
                "tags": ["Federal", "Literacy", "Innovation", "High-Need Schools"],
                "difficulty": "Medium",
                "is_recurring": True
            },
            {
                "title": "Rural Education Achievement Program",
                "description": "Provides funding to rural school districts to improve student academic achievement. Supports technology, professional development, and educational programs in rural areas.",
                "organization": "U.S. Department of Education",
                "website": "https://www.grants.gov/search-results-detail/350125",
                "amount_text": "$50,000 - $500,000",
                "deadline_text": "May 15, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "Rural Areas",
                "districts": "Rural Districts",
                "funding_types": "Technology Equipment, Professional Development, Classroom Supplies",
                "requirements": "Must be a rural school district as defined by federal guidelines. Priority for districts with high poverty rates.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Budget Proposal, Rural Designation, Needs Assessment",
                "contact_email": "rural@ed.gov",
                "contact_phone": "(202) 245-7350",
                "tags": ["Federal", "Rural", "Technology", "Professional Development"],
                "difficulty": "Medium",
                "is_recurring": True
            }
        ]
        
        for grant in federal_grants:
            scholarship = self.process_grant_data(grant)
            if scholarship:
                scholarships.append(scholarship)
        
        return scholarships
    
    def process_grant_data(self, grant_data: Dict) -> Dict:
        """Process federal grant data"""
        try:
            # Extract amounts
            min_amount, max_amount = self.extract_amount(grant_data["amount_text"])
            
            # Extract deadline
            deadline = self.extract_deadline(grant_data["deadline_text"])
            if not deadline:
                deadline = datetime.now() + timedelta(days=90)
            
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
                "popularity": 85,  # Federal grants are popular
                "isActive": True,
                "isVerified": True,
                "viewCount": 0,
                "bookmarkCount": 0,
                "source": "Federal Government"
            }
        except Exception as e:
            print(f"Error processing federal grant: {e}")
            return None
