#!/usr/bin/env python3
"""
Simple RTF Parser for WeAreTeachers.rtf
Uses a more direct approach to extract grant information
"""

import re
import json
from datetime import datetime
from striprtf.striprtf import rtf_to_text

def parse_weareteachers_grants():
    """Parse the WeAreTeachers RTF file and extract grant information"""
    
    # Read and clean the RTF file
    with open('WeAreTeachers.rtf', 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    cleaned = rtf_to_text(content)
    lines = cleaned.split('\n')
    
    grants = []
    current_grant = {}
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        
        # Check if this is a grant title (contains organization name and URL)
        if '(' in line and ')' in line and ('http' in line or 'www.' in line):
            # Save previous grant if exists
            if current_grant and current_grant.get('title'):
                grants.append(current_grant)
            
            # Start new grant
            current_grant = {
                'title': line,
                'organization': line.split('(')[0].strip(),
                'website': '',
                'description': '',
                'amount': '',
                'deadline': '',
                'eligibility': '',
                'tags': []
            }
            
            # Extract website from title
            url_match = re.search(r'\(([^)]+)\)', line)
            if url_match:
                current_grant['website'] = url_match.group(1)
        
        # Parse grant details
        elif current_grant:
            if line.startswith('What It Is:'):
                current_grant['description'] = line.replace('What It Is:', '').strip()
            elif line.startswith('Award:'):
                current_grant['amount'] = line.replace('Award:', '').strip()
            elif line.startswith('Deadline:'):
                current_grant['deadline'] = line.replace('Deadline:', '').strip()
            elif line.startswith('Application Requirements:'):
                current_grant['eligibility'] = line.replace('Application Requirements:', '').strip()
            elif line.startswith('What It Is:') or line.startswith('Award:') or line.startswith('Deadline:') or line.startswith('Application Requirements:'):
                # Skip section headers
                pass
            else:
                # Continue adding to current field
                if current_grant.get('description') and not line.startswith(('Award:', 'Deadline:', 'Application Requirements:')):
                    current_grant['description'] += ' ' + line
                elif current_grant.get('eligibility') and not line.startswith(('Award:', 'Deadline:', 'What It Is:')):
                    current_grant['eligibility'] += ' ' + line
    
    # Add the last grant
    if current_grant and current_grant.get('title'):
        grants.append(current_grant)
    
    # Generate tags for each grant
    for grant in grants:
        tags = []
        content = f"{grant.get('title', '')} {grant.get('description', '')} {grant.get('eligibility', '')}".lower()
        
        # Subject area tags
        if any(word in content for word in ['steam', 'science', 'technology', 'engineering', 'math', 'stem']):
            tags.append('STEAM')
        if any(word in content for word in ['professional', 'development', 'training', 'conference']):
            tags.append('Professional Development')
        if any(word in content for word in ['classroom', 'supplies', 'materials', 'equipment']):
            tags.append('Classroom Supplies')
        if any(word in content for word in ['arts', 'music', 'creative', 'artistic']):
            tags.append('Arts Education')
        if any(word in content for word in ['literacy', 'reading', 'books', 'language']):
            tags.append('Literacy')
        if any(word in content for word in ['special', 'needs', 'inclusive', 'disabilities']):
            tags.append('Special Education')
        
        # Grade level tags
        if any(word in content for word in ['elementary', 'primary', 'k-5', 'k-6']):
            tags.append('Elementary')
        if any(word in content for word in ['middle school', '6-8', '7-8']):
            tags.append('Middle School')
        if any(word in content for word in ['high school', 'secondary', '9-12']):
            tags.append('High School')
        if any(word in content for word in ['pre-k', 'preschool', 'early childhood']):
            tags.append('Early Childhood')
        
        # Grant type tags
        if any(word in content for word in ['mini-grant', 'mini grant', 'small grant']):
            tags.append('Mini Grant')
        if any(word in content for word in ['classroom grant', 'teacher grant']):
            tags.append('Classroom Grant')
        if any(word in content for word in ['technology', 'computer', 'digital']):
            tags.append('Technology')
        
        # Organization type tags
        title_lower = grant.get('title', '').lower()
        if any(word in title_lower for word in ['foundation', 'fund']):
            tags.append('Foundation')
        if any(word in title_lower for word in ['corporation', 'corp', 'company']):
            tags.append('Corporate')
        if any(word in title_lower for word in ['government', 'federal', 'state']):
            tags.append('Government')
        
        grant['tags'] = list(set(tags))
    
    return grants

def main():
    """Main function to run the parser"""
    print("🚀 Starting WeAreTeachers grant extraction...")
    
    grants = parse_weareteachers_grants()
    
    if grants:
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"weareteachers_grants_{timestamp}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(grants, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully extracted {len(grants)} grants")
        print(f"📁 Saved to: {output_file}")
        
        # Show sample grants
        print(f"\n📋 Sample grants:")
        for i, grant in enumerate(grants[:5]):
            print(f"   {i+1}. {grant['title']}")
            print(f"      Organization: {grant['organization']}")
            print(f"      Amount: {grant['amount'] or 'Not specified'}")
            print(f"      Deadline: {grant['deadline'] or 'Not specified'}")
            print(f"      Tags: {', '.join(grant['tags']) if grant['tags'] else 'None'}")
            print()
    else:
        print("❌ No grants were extracted")

if __name__ == "__main__":
    main()
