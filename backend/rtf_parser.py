#!/usr/bin/env python3
"""
RTF Parser for WeAreTeachers.rtf
Extracts clean text content from RTF format for grant processing
"""

import re
import json
from datetime import datetime
from striprtf.striprtf import rtf_to_text

class RTFParser:
    def __init__(self, rtf_file_path):
        self.rtf_file_path = rtf_file_path
        self.content = ""
        
    def read_rtf_file(self):
        """Read the RTF file content"""
        try:
            with open(self.rtf_file_path, 'r', encoding='utf-8', errors='ignore') as file:
                self.content = file.read()
            print(f"✅ Successfully read RTF file: {len(self.content)} characters")
            return True
        except Exception as e:
            print(f"❌ Error reading RTF file: {e}")
            return False
    
    def clean_rtf_content(self):
        """Remove RTF formatting codes and extract clean text using striprtf"""
        if not self.content:
            print("❌ No content to clean")
            return ""
        
        try:
            # Use striprtf library for better RTF parsing
            cleaned = rtf_to_text(self.content)
            
            # Additional cleaning for better structure
            # Clean up excessive whitespace
            cleaned = re.sub(r'\s+', ' ', cleaned)
            cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned)
            
            # Remove empty lines
            lines = cleaned.split('\n')
            cleaned_lines = [line.strip() for line in lines if line.strip()]
            
            return '\n'.join(cleaned_lines)
            
        except Exception as e:
            print(f"⚠️ Error using striprtf, falling back to manual parsing: {e}")
            # Fallback to manual parsing if striprtf fails
            return self._manual_rtf_clean()
    
    def _manual_rtf_clean(self):
        """Manual RTF cleaning as fallback"""
        cleaned = self.content
        
        # Remove RTF document header
        cleaned = re.sub(r'\\rtf1.*?\\fonttbl.*?}', '', cleaned, flags=re.DOTALL)
        
        # Remove color table
        cleaned = re.sub(r'\\colortbl.*?}', '', cleaned, flags=re.DOTALL)
        
        # Remove list table
        cleaned = re.sub(r'\\listtable.*?}', '', cleaned, flags=re.DOTALL)
        
        # Remove font and formatting commands
        cleaned = re.sub(r'\\f[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\fs[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\cf[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\cb[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\b[0-9]*', '', cleaned)
        cleaned = re.sub(r'\\i[0-9]*', '', cleaned)
        cleaned = re.sub(r'\\ul[0-9]*', '', cleaned)
        cleaned = re.sub(r'\\ulc[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\strokec[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\strokewidth[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\kerning[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\expnd[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\expndtw[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\outl[0-9]+', '', cleaned)
        
        # Remove list formatting
        cleaned = re.sub(r'\\ls[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\ilvl[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\listtext.*?}', '', cleaned, flags=re.DOTALL)
        
        # Remove bullet points and special characters
        cleaned = re.sub(r'\\uc0\\u8226', '•', cleaned)
        cleaned = re.sub(r'\\uc0\\u[0-9]+', '', cleaned)
        cleaned = re.sub(r'\\\'[0-9a-f]{2}', '', cleaned)
        
        # Remove remaining RTF commands
        cleaned = re.sub(r'\\[a-zA-Z]+[0-9]*', '', cleaned)
        
        # Clean up whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned)
        
        # Remove empty lines
        lines = cleaned.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        
        return '\n'.join(cleaned_lines)
    
    def extract_grant_sections(self, cleaned_content):
        """Extract individual grant sections from cleaned content"""
        sections = []
        lines = cleaned_content.split('\n')
        
        current_section = []
        current_title = ""
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Check if this line is a grant title (contains organization name and often has a URL)
            is_grant_title = (
                # Contains organization name and URL in parentheses
                ('(' in line and ')' in line and ('http' in line or 'www.' in line)) or
                # Contains common grant keywords
                any(keyword in line.lower() for keyword in [
                    'grant', 'program', 'award', 'fund', 'scholarship', 'foundation',
                    'donorschoose', 'voya', 'unsung heroes', 'mitsubishi', 'conocophillips',
                    'ezra jack keats', 'association of american educators', 'casey',
                    'walmart', 'computers for learning', 'pets in classroom'
                ]) and
                # Not a section header (like "General Education Grants for Teachers")
                not line.endswith('Schools') and
                not line.endswith('Teachers') and
                not line.endswith('Educators')
            )
            
            if is_grant_title:
                # Save previous section if exists
                if current_title and current_section:
                    sections.append({
                        'title': current_title,
                        'content': '\n'.join(current_section)
                    })
                
                # Start new section
                current_title = line
                current_section = []
            else:
                current_section.append(line)
        
        # Add the last section
        if current_title and current_section:
            sections.append({
                'title': current_title,
                'content': '\n'.join(current_section)
            })
        
        return sections
    
    def parse_grant_info(self, section):
        """Parse individual grant section to extract structured information"""
        title = section['title']
        content = section['content']
        
        grant_info = {
            'title': title,
            'description': '',
            'amount': '',
            'deadline': '',
            'eligibility': '',
            'organization': '',
            'website': '',
            'tags': [],
            'raw_content': content
        }
        
        # Extract organization name from title (remove URL part)
        org_name = title.split('(')[0].strip()
        grant_info['organization'] = org_name
        
        # Extract website from title
        url_match = re.search(r'\(([^)]+)\)', title)
        if url_match:
            grant_info['website'] = url_match.group(1)
        
        # Parse structured content
        lines = content.split('\n')
        current_field = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check for field labels
            if line.startswith('What It Is:'):
                current_field = 'description'
                grant_info['description'] = line.replace('What It Is:', '').strip()
            elif line.startswith('Award:'):
                current_field = 'amount'
                grant_info['amount'] = line.replace('Award:', '').strip()
            elif line.startswith('Deadline:'):
                current_field = 'deadline'
                grant_info['deadline'] = line.replace('Deadline:', '').strip()
            elif line.startswith('Application Requirements:'):
                current_field = 'eligibility'
                grant_info['eligibility'] = line.replace('Application Requirements:', '').strip()
            else:
                # Continue adding to current field
                if current_field == 'description' and grant_info['description']:
                    grant_info['description'] += ' ' + line
                elif current_field == 'eligibility' and grant_info['eligibility']:
                    grant_info['eligibility'] += ' ' + line
        
        # Clean up extracted fields
        for field in ['description', 'amount', 'deadline', 'eligibility']:
            if grant_info[field]:
                grant_info[field] = grant_info[field].strip()
        
        # Generate tags based on content
        tags = []
        content_lower = content.lower()
        title_lower = title.lower()
        
        # Subject area tags
        if any(word in content_lower for word in ['steam', 'science', 'technology', 'engineering', 'math', 'stem']):
            tags.append('STEAM')
        if any(word in content_lower for word in ['professional', 'development', 'training', 'conference']):
            tags.append('Professional Development')
        if any(word in content_lower for word in ['classroom', 'supplies', 'materials', 'equipment']):
            tags.append('Classroom Supplies')
        if any(word in content_lower for word in ['arts', 'music', 'creative', 'artistic']):
            tags.append('Arts Education')
        if any(word in content_lower for word in ['literacy', 'reading', 'books', 'language']):
            tags.append('Literacy')
        if any(word in content_lower for word in ['special', 'needs', 'inclusive', 'disabilities']):
            tags.append('Special Education')
        
        # Grade level tags
        if any(word in content_lower for word in ['elementary', 'primary', 'k-5', 'k-6']):
            tags.append('Elementary')
        if any(word in content_lower for word in ['middle school', '6-8', '7-8']):
            tags.append('Middle School')
        if any(word in content_lower for word in ['high school', 'secondary', '9-12']):
            tags.append('High School')
        if any(word in content_lower for word in ['pre-k', 'preschool', 'early childhood']):
            tags.append('Early Childhood')
        
        # Grant type tags
        if any(word in content_lower for word in ['mini-grant', 'mini grant', 'small grant']):
            tags.append('Mini Grant')
        if any(word in content_lower for word in ['classroom grant', 'teacher grant']):
            tags.append('Classroom Grant')
        if any(word in content_lower for word in ['technology', 'computer', 'digital']):
            tags.append('Technology')
        
        # Organization type tags
        if any(word in title_lower for word in ['foundation', 'fund']):
            tags.append('Foundation')
        if any(word in title_lower for word in ['corporation', 'corp', 'company']):
            tags.append('Corporate')
        if any(word in title_lower for word in ['government', 'federal', 'state']):
            tags.append('Government')
        
        grant_info['tags'] = list(set(tags))  # Remove duplicates
        
        return grant_info
    
    def process_rtf(self):
        """Main method to process the RTF file"""
        print("🚀 Starting RTF processing...")
        
        # Step 1: Read file
        if not self.read_rtf_file():
            return None
        
        # Step 2: Clean content
        print("🧹 Cleaning RTF content...")
        cleaned_content = self.clean_rtf_content()
        
        # Step 3: Extract sections
        print("📋 Extracting grant sections...")
        sections = self.extract_grant_sections(cleaned_content)
        print(f"✅ Found {len(sections)} grant sections")
        
        # Step 4: Parse each section
        print("🔍 Parsing grant information...")
        grants = []
        for i, section in enumerate(sections):
            print(f"  Processing section {i+1}/{len(sections)}: {section['title'][:50]}...")
            grant_info = self.parse_grant_info(section)
            grants.append(grant_info)
        
        return grants
    
    def save_results(self, grants, output_file):
        """Save processed grants to JSON file"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(grants, f, indent=2, ensure_ascii=False)
            print(f"✅ Saved {len(grants)} grants to {output_file}")
            return True
        except Exception as e:
            print(f"❌ Error saving results: {e}")
            return False

def main():
    """Main function to run the RTF parser"""
    parser = RTFParser('WeAreTeachers.rtf')
    
    # Process the RTF file
    grants = parser.process_rtf()
    
    if grants:
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"extracted_grants_{timestamp}.json"
        parser.save_results(grants, output_file)
        
        # Print summary
        print(f"\n📊 Processing Summary:")
        print(f"   Total grants extracted: {len(grants)}")
        print(f"   Output file: {output_file}")
        
        # Show sample grants
        print(f"\n📋 Sample grants:")
        for i, grant in enumerate(grants[:3]):
            print(f"   {i+1}. {grant['title']}")
            print(f"      Amount: {grant['amount'] or 'Not specified'}")
            print(f"      Tags: {', '.join(grant['tags']) if grant['tags'] else 'None'}")
            print()
    else:
        print("❌ No grants were extracted")

if __name__ == "__main__":
    main()
