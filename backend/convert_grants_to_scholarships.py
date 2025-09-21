#!/usr/bin/env python3
"""
Convert WeAreTeachers grants to Scholarship model format
"""

import json
import re
from datetime import datetime, timedelta
import random

def parse_amount(amount_str):
    """Parse amount string and return min/max values with special formatting"""
    if not amount_str or amount_str.lower() in ['varies', 'not specified', 'contact for details']:
        return {'min': 0, 'max': 0, 'display': 'Varies'}
    
    # Remove common words
    amount_str = re.sub(r'\b(up to|maximum|max|minimum|min)\b', '', amount_str, flags=re.IGNORECASE)
    
    # Extract dollar amounts
    amounts = re.findall(r'\$?([0-9,]+(?:K|M)?)', amount_str, re.IGNORECASE)
    
    if not amounts:
        return {'min': 0, 'max': 0, 'display': 'Varies'}
    
    def parse_amount_value(amt):
        try:
            amt = amt.replace(',', '')
            if amt.upper().endswith('K'):
                return int(amt[:-1]) * 1000
            elif amt.upper().endswith('M'):
                return int(amt[:-1]) * 1000000
            else:
                return int(amt)
        except (ValueError, TypeError):
            return 0
    
    amounts = [parse_amount_value(amt) for amt in amounts if amt.strip()]
    
    if not amounts or all(amt == 0 for amt in amounts):
        return {'min': 0, 'max': 0, 'display': 'Varies'}
    
    if len(amounts) == 1:
        return {'min': amounts[0], 'max': amounts[0], 'display': f'${amounts[0]:,}'}
    else:
        min_amt = min(amounts)
        max_amt = max(amounts)
        
        # Special case: if min is 0, display as "Up to $X"
        if min_amt == 0:
            return {'min': min_amt, 'max': max_amt, 'display': f'Up to ${max_amt:,}'}
        else:
            return {'min': min_amt, 'max': max_amt, 'display': f'${min_amt:,} - ${max_amt:,}'}

def parse_deadline(deadline_str):
    """Parse deadline string and return a date"""
    if not deadline_str or deadline_str.lower() in ['ongoing', 'rolling', 'not specified']:
        # For ongoing grants, set deadline to next year
        return datetime.now() + timedelta(days=365)
    
    # Look for specific dates
    date_patterns = [
        r'(\w+ \d{1,2}, \d{4})',  # "April 18, 2025"
        r'(\d{1,2}/\d{1,2}/\d{4})',  # "12/31/2024"
        r'(\w+ \d{1,2})',  # "July 31" (assume current year)
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, deadline_str)
        if match:
            date_str = match.group(1)
            try:
                if ',' in date_str:
                    return datetime.strptime(date_str, '%B %d, %Y')
                elif '/' in date_str:
                    return datetime.strptime(date_str, '%m/%d/%Y')
                else:
                    # Assume current year
                    return datetime.strptime(f"{date_str}, {datetime.now().year}", '%B %d, %Y')
            except ValueError:
                continue
    
    # If no specific date found, set to 6 months from now
    return datetime.now() + timedelta(days=180)

def determine_grade_levels(tags, content):
    """Determine grade levels based on tags and content"""
    content_lower = content.lower()
    
    grade_levels = []
    
    if any(word in content_lower for word in ['pre-k', 'preschool', 'early childhood', 'k-2', 'k-3']):
        grade_levels.extend(['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade'])
    elif any(word in content_lower for word in ['elementary', 'primary', 'k-5', 'k-6']):
        grade_levels.extend(['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade'])
    elif any(word in content_lower for word in ['middle school', '6-8', '7-8']):
        grade_levels.extend(['6th Grade', '7th Grade', '8th Grade'])
    elif any(word in content_lower for word in ['high school', 'secondary', '9-12']):
        grade_levels.extend(['9th Grade', '10th Grade', '11th Grade', '12th Grade'])
    else:
        # Default to all grade levels
        grade_levels = ['Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', 
                       '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']
    
    return grade_levels

def determine_subjects(tags, content):
    """Determine subjects based on tags and content"""
    content_lower = content.lower()
    subjects = []
    
    if any(word in content_lower for word in ['science', 'stem', 'steam', 'technology', 'engineering', 'math']):
        subjects.extend(['Science', 'Mathematics', 'Computer Science'])
    if any(word in content_lower for word in ['arts', 'music', 'creative', 'artistic', 'visual']):
        subjects.extend(['Art', 'Music'])
    if any(word in content_lower for word in ['literacy', 'reading', 'books', 'language', 'english']):
        subjects.extend(['English/Language Arts', 'Reading', 'Writing'])
    if any(word in content_lower for word in ['social studies', 'history', 'geography', 'civics']):
        subjects.extend(['Social Studies', 'History'])
    if any(word in content_lower for word in ['special education', 'inclusive', 'disabilities']):
        subjects.extend(['Special Education'])
    
    # If no specific subjects found, add general ones
    if not subjects:
        subjects = ['Any']
    
    return subjects

def determine_funding_types(tags, content):
    """Determine funding types based on tags and content"""
    content_lower = content.lower()
    funding_types = []
    
    if any(word in content_lower for word in ['classroom', 'supplies', 'materials', 'equipment']):
        funding_types.append('Classroom Supplies')
    if any(word in content_lower for word in ['technology', 'computer', 'digital', 'software']):
        funding_types.append('Technology Equipment')
    if any(word in content_lower for word in ['books', 'reading', 'literacy']):
        funding_types.append('Books and Materials')
    if any(word in content_lower for word in ['professional', 'development', 'training', 'conference']):
        funding_types.append('Professional Development')
    if any(word in content_lower for word in ['field trip', 'field trips']):
        funding_types.append('Field Trips')
    if any(word in content_lower for word in ['special', 'program', 'programs']):
        funding_types.append('Special Programs')
    if any(word in content_lower for word in ['student', 'support', 'tutoring']):
        funding_types.append('Student Support')
    
    # If no specific types found, add general
    if not funding_types:
        funding_types = ['General']
    
    return funding_types

def convert_grant_to_scholarship(grant):
    """Convert a grant to Scholarship model format"""
    
    # Parse amount
    amount_info = parse_amount(grant.get('amount', ''))
    
    # Parse deadline
    deadline = parse_deadline(grant.get('deadline', ''))
    
    # Determine grade levels
    content = f"{grant.get('title', '')} {grant.get('description', '')} {grant.get('eligibility', '')}"
    grade_levels = determine_grade_levels(grant.get('tags', []), content)
    
    # Determine subjects
    subjects = determine_subjects(grant.get('tags', []), content)
    
    # Determine funding types
    funding_types = determine_funding_types(grant.get('tags', []), content)
    
    # Determine regions (default to national)
    regions = ['National']
    
    # Determine districts (default to all)
    districts = ['All Districts']
    
    # Determine documents required
    documents_required = ['Application Form', 'Project Description']
    if 'professional development' in content.lower():
        documents_required.append('Professional Development Plan')
    if 'technology' in content.lower():
        documents_required.append('Technology Plan')
    
    # Clean up the title - remove "Award" and other common words
    title = grant.get('title', '')
    title = re.sub(r'\s*\([^)]*\)$', '', title)  # Remove URL part from title
    title = re.sub(r'\s+(Award|Grant|Program|Fund|Scholarship|Foundation)$', '', title, flags=re.IGNORECASE)
    title = title.strip()
    
    # Clean up website URL
    website = grant.get('website', '').strip('"')
    
    # Create scholarship object
    scholarship = {
        'title': title,
        'organization': grant.get('organization', ''),
        'description': grant.get('description', '') or 'Grant opportunity for educators',
        'amount': amount_info,
        'eligibility': {
            'gradeLevels': grade_levels,
            'subjects': subjects,
            'regions': regions,
            'districts': districts,
            'fundingTypes': funding_types,
            'requirements': grant.get('eligibility', '')
        },
        'application': {
            'deadline': deadline.isoformat(),
            'website': website,
            'applicationUrl': website,
            'documentsRequired': documents_required,
            'instructions': f"Visit {website} for application instructions"
        },
        'status': 'Open' if 'ongoing' in grant.get('deadline', '').lower() else 'Apply Soon',
        'isActive': True,
        'source': 'WeAreTeachers',
        'tags': grant.get('tags', []),
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    return scholarship

def main():
    """Main function to convert grants to scholarships"""
    print("🚀 Converting WeAreTeachers grants to Scholarship format...")
    
    # Find the latest grants file
    import glob
    grant_files = glob.glob("weareteachers_grants_*.json")
    if not grant_files:
        print("❌ No grants file found. Run simple_rtf_parser.py first.")
        return
    
    latest_file = max(grant_files)
    print(f"📁 Reading grants from: {latest_file}")
    
    # Load grants
    with open(latest_file, 'r', encoding='utf-8') as f:
        grants = json.load(f)
    
    print(f"📊 Found {len(grants)} grants to convert")
    
    # Convert grants to scholarships
    scholarships = []
    for i, grant in enumerate(grants):
        print(f"  Converting grant {i+1}/{len(grants)}: {grant.get('title', '')[:50]}...")
        try:
            scholarship = convert_grant_to_scholarship(grant)
            scholarships.append(scholarship)
        except Exception as e:
            print(f"    ⚠️ Error converting grant: {e}")
            continue
    
    # Save converted scholarships
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f"converted_scholarships_{timestamp}.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(scholarships, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully converted {len(scholarships)} grants to scholarships")
    print(f"📁 Saved to: {output_file}")
    
    # Show sample scholarships
    print(f"\n📋 Sample scholarships:")
    for i, scholarship in enumerate(scholarships[:3]):
        print(f"   {i+1}. {scholarship['title']}")
        print(f"      Organization: {scholarship['organization']}")
        print(f"      Amount: ${scholarship['amount']['min']:,} - ${scholarship['amount']['max']:,}")
        print(f"      Deadline: {scholarship['application']['deadline'][:10]}")
        print(f"      Tags: {', '.join(scholarship['tags']) if scholarship['tags'] else 'None'}")
        print()

if __name__ == "__main__":
    main()
