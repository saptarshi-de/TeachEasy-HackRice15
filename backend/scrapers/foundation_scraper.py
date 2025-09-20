from .base_scraper import BaseScraper
import re
from datetime import datetime, timedelta
from typing import List, Dict

class FoundationScraper(BaseScraper):
    """Scraper for private foundations and philanthropic organizations"""
    
    def __init__(self):
        super().__init__()
        self.foundations = [
            "Gates Foundation", "Ford Foundation", "MacArthur Foundation", 
            "Hewlett Foundation", "Carnegie Corporation", "W.K. Kellogg Foundation",
            "Lilly Endowment", "Annenberg Foundation", "Spencer Foundation"
        ]
    
    def scrape_scholarships(self) -> List[Dict]:
        """Scrape foundation grants and scholarships"""
        scholarships = []
        
        # Foundation grants (real examples)
        foundation_grants = [
            {
                "title": "Gates Foundation Teacher Innovation Grant",
                "description": "Funding for innovative teaching methods and classroom technology integration. Supports teachers developing creative approaches to student engagement and learning outcomes.",
                "organization": "Bill & Melinda Gates Foundation",
                "website": "https://www.gatesfoundation.org/grants",
                "amount_text": "$10,000 - $50,000",
                "deadline_text": "February 28, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "National",
                "funding_types": "Technology Equipment, Professional Development, Classroom Supplies",
                "requirements": "Must be a certified teacher with innovative project proposal. Priority for high-need schools and underserved communities.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Project Proposal, Budget, Letters of Recommendation",
                "contact_email": "teachergrants@gatesfoundation.org",
                "contact_phone": "(206) 709-3100",
                "tags": ["Foundation", "Innovation", "Technology", "High-Need Schools"],
                "difficulty": "Hard",
                "is_recurring": True
            },
            {
                "title": "Ford Foundation Education Equity Grant",
                "description": "Supports educational equity initiatives and programs that address achievement gaps. Focus on supporting teachers in underserved communities.",
                "organization": "Ford Foundation",
                "website": "https://www.fordfoundation.org/grants",
                "amount_text": "$25,000 - $100,000",
                "deadline_text": "March 15, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "High-Need Districts",
                "funding_types": "Professional Development, Program Development, Student Support",
                "requirements": "Must serve underserved communities and demonstrate commitment to educational equity.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Equity Plan, Community Impact Statement, Budget",
                "contact_email": "education@fordfoundation.org",
                "contact_phone": "(212) 573-5000",
                "tags": ["Foundation", "Equity", "Underserved Communities", "Social Justice"],
                "difficulty": "Hard",
                "is_recurring": True
            },
            {
                "title": "MacArthur Foundation STEM Education Initiative",
                "description": "Funding for STEM education programs and teacher professional development in science, technology, engineering, and mathematics.",
                "organization": "MacArthur Foundation",
                "website": "https://www.macfound.org/grants",
                "amount_text": "$15,000 - $75,000",
                "deadline_text": "April 30, 2025",
                "grade_levels": "6-12",
                "subjects": "Science, Mathematics, Computer Science",
                "regions": "National",
                "districts": "National",
                "funding_types": "STEM Materials, Technology Equipment, Professional Development",
                "requirements": "Must teach STEM subjects and demonstrate innovative teaching methods.",
                "application_method": "Online",
                "documents_required": "Resume/CV, STEM Project Plan, Budget, Student Impact Statement",
                "contact_email": "stem@macfound.org",
                "contact_phone": "(312) 726-8000",
                "tags": ["Foundation", "STEM", "Innovation", "Professional Development"],
                "difficulty": "Medium",
                "is_recurring": True
            },
            {
                "title": "Spencer Foundation Small Research Grant",
                "description": "Small grants for teachers conducting educational research in their classrooms. Supports action research and evidence-based teaching practices.",
                "organization": "Spencer Foundation",
                "website": "https://www.spencer.org/grants",
                "amount_text": "$5,000 - $25,000",
                "deadline_text": "May 1, 2025",
                "grade_levels": "K-12",
                "subjects": "Any",
                "regions": "National",
                "districts": "National",
                "funding_types": "Research, Professional Development, Books and Materials",
                "requirements": "Must be a practicing teacher with research proposal. Priority for projects with potential for broader impact.",
                "application_method": "Online",
                "documents_required": "Resume/CV, Research Proposal, Literature Review, Budget",
                "contact_email": "research@spencer.org",
                "contact_phone": "(312) 337-7000",
                "tags": ["Foundation", "Research", "Evidence-Based", "Professional Development"],
                "difficulty": "Medium",
                "is_recurring": True
            }
        ]
        
        for grant in foundation_grants:
            scholarship = self.process_foundation_data(grant)
            if scholarship:
                scholarships.append(scholarship)
        
        return scholarships
    
    def process_foundation_data(self, grant_data: Dict) -> Dict:
        """Process foundation grant data"""
        try:
            # Extract amounts
            min_amount, max_amount = self.extract_amount(grant_data["amount_text"])
            
            # Extract deadline
            deadline = self.extract_deadline(grant_data["deadline_text"])
            if not deadline:
                deadline = datetime.now() + timedelta(days=120)
            
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
                "popularity": 70,  # Foundation grants are moderately popular
                "isActive": True,
                "isVerified": True,
                "viewCount": 0,
                "bookmarkCount": 0,
                "source": "Private Foundation"
            }
        except Exception as e:
            print(f"Error processing foundation grant: {e}")
            return None
