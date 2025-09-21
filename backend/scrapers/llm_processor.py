#!/usr/bin/env python3
"""
LLM-enhanced processor for scraped grants and scholarships data
Validates, enhances, and standardizes the scraped information
"""

import json
import re
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMOpportunityProcessor:
    def __init__(self):
        self.opportunity_types = {
            'grant': {
                'keywords': ['grant', 'funding', 'award', 'support', 'sponsor'],
                'description_keywords': ['classroom', 'project', 'resources', 'materials', 'equipment']
            },
            'scholarship': {
                'keywords': ['scholarship', 'tuition', 'education', 'degree', 'certification'],
                'description_keywords': ['student', 'teacher', 'education', 'program', 'course']
            }
        }
    
    def classify_opportunity_type(self, title, description):
        """Classify opportunity as grant or scholarship based on content"""
        text = f"{title} {description}".lower()
        
        grant_score = 0
        scholarship_score = 0
        
        # Check for grant keywords
        for keyword in self.opportunity_types['grant']['keywords']:
            if keyword in text:
                grant_score += 1
        
        for keyword in self.opportunity_types['grant']['description_keywords']:
            if keyword in text:
                grant_score += 0.5
        
        # Check for scholarship keywords
        for keyword in self.opportunity_types['scholarship']['keywords']:
            if keyword in text:
                scholarship_score += 1
        
        for keyword in self.opportunity_types['scholarship']['description_keywords']:
            if keyword in text:
                scholarship_score += 0.5
        
        # Return classification
        if grant_score > scholarship_score:
            return 'grant'
        elif scholarship_score > grant_score:
            return 'scholarship'
        else:
            return 'grant'  # Default to grant if unclear
    
    def validate_and_enhance_amount(self, amount_data, title, description):
        """Validate and enhance amount information"""
        if not amount_data:
            amount_data = {"min": 0, "max": 0, "currency": "USD"}
        
        # Extract amounts from title and description if missing
        text = f"{title} {description}"
        amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
        
        if amounts and (amount_data.get('min', 0) == 0 or amount_data.get('max', 0) == 0):
            clean_amounts = []
            for amount in amounts:
                clean = re.sub(r'[$,]', '', amount)
                try:
                    clean_amounts.append(int(float(clean)))
                except:
                    continue
            
            if clean_amounts:
                amount_data['min'] = min(clean_amounts)
                amount_data['max'] = max(clean_amounts)
        
        # Handle special cases
        if 'varies' in text.lower() or 'contact' in text.lower():
            amount_data['note'] = 'Amount varies - contact organization for details'
        
        return amount_data
    
    def validate_deadline(self, deadline_str):
        """Validate and fix deadline dates"""
        if not deadline_str:
            # Default to 6 months from now
            return (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
        
        try:
            # Parse the deadline
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d %H:%M:%S')
            
            # If deadline is in the past, move to next year
            if deadline < datetime.now():
                deadline = deadline.replace(year=deadline.year + 1)
            
            return deadline.strftime('%Y-%m-%d %H:%M:%S')
        except:
            # If parsing fails, return default
            return (datetime.now() + timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
    
    def enhance_description(self, title, description, opportunity_type):
        """Enhance description with more context"""
        if not description or len(description) < 50:
            if opportunity_type == 'grant':
                description = f"Funding opportunity for teachers: {title}. This grant supports classroom projects, resources, and educational initiatives."
            else:
                description = f"Scholarship opportunity for educators: {title}. This scholarship supports teacher education and professional development."
        
        # Ensure description is not too long
        if len(description) > 500:
            description = description[:497] + "..."
        
        return description
    
    def extract_tags(self, title, description, opportunity_type):
        """Extract relevant tags from title and description"""
        text = f"{title} {description}".lower()
        tags = [opportunity_type]
        
        # Common tag patterns
        tag_patterns = {
            'stem': ['stem', 'science', 'technology', 'engineering', 'math'],
            'arts': ['art', 'music', 'creative', 'visual', 'performing'],
            'literacy': ['literacy', 'reading', 'writing', 'language'],
            'special-education': ['special education', 'disability', 'inclusive'],
            'professional-development': ['professional development', 'training', 'workshop'],
            'classroom-supplies': ['supplies', 'materials', 'equipment', 'resources'],
            'technology': ['technology', 'digital', 'computer', 'software'],
            'field-trips': ['field trip', 'excursion', 'experience'],
            'texas': ['texas', 'tx'],
            'national': ['national', 'nationwide', 'countrywide']
        }
        
        for tag, keywords in tag_patterns.items():
            if any(keyword in text for keyword in keywords):
                tags.append(tag)
        
        return list(set(tags))  # Remove duplicates
    
    def validate_eligibility(self, eligibility_data, opportunity_type):
        """Validate and enhance eligibility information"""
        if not eligibility_data:
            eligibility_data = {}
        
        # Set default grade levels if missing
        if not eligibility_data.get('gradeLevels'):
            eligibility_data['gradeLevels'] = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
        
        # Set default subjects if missing
        if not eligibility_data.get('subjects'):
            eligibility_data['subjects'] = ["Any"]
        
        # Set default regions if missing
        if not eligibility_data.get('regions'):
            eligibility_data['regions'] = ["National"]
        
        # Set default funding types based on opportunity type
        if not eligibility_data.get('fundingTypes'):
            if opportunity_type == 'grant':
                eligibility_data['fundingTypes'] = ["Classroom Supplies", "Technology Equipment", "Professional Development"]
            else:
                eligibility_data['fundingTypes'] = ["Professional Development", "Education Programs"]
        
        # Set default requirements if missing
        if not eligibility_data.get('requirements'):
            if opportunity_type == 'grant':
                eligibility_data['requirements'] = "Must be a teacher or educational organization. See website for specific requirements."
            else:
                eligibility_data['requirements'] = "Must be pursuing or planning to pursue a teaching career. See website for specific requirements."
        
        return eligibility_data
    
    def process_opportunity(self, opportunity):
        """Process a single opportunity with LLM-like enhancements"""
        try:
            # Classify opportunity type
            opportunity_type = self.classify_opportunity_type(
                opportunity.get('title', ''),
                opportunity.get('description', '')
            )
            opportunity['type'] = opportunity_type
            
            # Validate and enhance amount
            opportunity['amount'] = self.validate_and_enhance_amount(
                opportunity.get('amount', {}),
                opportunity.get('title', ''),
                opportunity.get('description', '')
            )
            
            # Validate deadline
            opportunity['application']['deadline'] = self.validate_deadline(
                opportunity.get('application', {}).get('deadline', '')
            )
            
            # Enhance description
            opportunity['description'] = self.enhance_description(
                opportunity.get('title', ''),
                opportunity.get('description', ''),
                opportunity_type
            )
            
            # Extract tags
            opportunity['tags'] = self.extract_tags(
                opportunity.get('title', ''),
                opportunity.get('description', ''),
                opportunity_type
            )
            
            # Validate eligibility
            opportunity['eligibility'] = self.validate_eligibility(
                opportunity.get('eligibility', {}),
                opportunity_type
            )
            
            # Set default values for missing fields
            opportunity.setdefault('difficulty', 'Medium')
            opportunity.setdefault('popularity', 75)
            opportunity.setdefault('isActive', True)
            opportunity.setdefault('isVerified', True)
            
            # Ensure application structure
            if 'application' not in opportunity:
                opportunity['application'] = {}
            
            opportunity['application'].setdefault('applicationMethod', 'Online')
            opportunity['application'].setdefault('documentsRequired', ['Application Form'])
            opportunity['application'].setdefault('isRecurring', True)
            opportunity['application']['nextDeadline'] = opportunity['application']['deadline']
            
            # Ensure contact structure
            if 'contact' not in opportunity:
                opportunity['contact'] = {}
            
            opportunity['contact'].setdefault('email', 'info@organization.org')
            
            return opportunity
            
        except Exception as e:
            logger.error(f"Error processing opportunity {opportunity.get('title', 'Unknown')}: {e}")
            return opportunity
    
    def process_opportunities(self, opportunities):
        """Process all opportunities with LLM-like enhancements"""
        logger.info(f"Processing {len(opportunities)} opportunities...")
        
        processed_opportunities = []
        
        for opportunity in opportunities:
            try:
                processed = self.process_opportunity(opportunity)
                processed_opportunities.append(processed)
            except Exception as e:
                logger.error(f"Error processing opportunity: {e}")
                continue
        
        logger.info(f"Successfully processed {len(processed_opportunities)} opportunities")
        return processed_opportunities
    
    def generate_summary(self, opportunities):
        """Generate a summary of processed opportunities"""
        grants = [op for op in opportunities if op.get('type') == 'grant']
        scholarships = [op for op in opportunities if op.get('type') == 'scholarship']
        
        summary = {
            'total_opportunities': len(opportunities),
            'grants': len(grants),
            'scholarships': len(scholarships),
            'sources': list(set(op.get('source', 'Unknown') for op in opportunities)),
            'date_processed': datetime.now().isoformat()
        }
        
        return summary

if __name__ == "__main__":
    # Example usage
    processor = LLMOpportunityProcessor()
    
    # Load sample data
    with open('data/scraped_opportunities_sample.json', 'r') as f:
        opportunities = json.load(f)
    
    # Process opportunities
    processed = processor.process_opportunities(opportunities)
    
    # Generate summary
    summary = processor.generate_summary(processed)
    print("Processing Summary:")
    print(json.dumps(summary, indent=2))
    
    # Save processed data
    with open('data/processed_opportunities.json', 'w') as f:
        json.dump(processed, f, indent=2)
    
    print(f"Processed {len(processed)} opportunities saved to data/processed_opportunities.json")
