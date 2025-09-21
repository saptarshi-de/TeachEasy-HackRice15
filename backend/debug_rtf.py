#!/usr/bin/env python3
"""
Debug script to examine RTF content and improve parsing
"""

import re
from striprtf.striprtf import rtf_to_text

def debug_rtf():
    # Read the RTF file
    with open('WeAreTeachers.rtf', 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    print(f"Original content length: {len(content)}")
    
    # Clean with striprtf
    cleaned = rtf_to_text(content)
    print(f"Cleaned content length: {len(cleaned)}")
    
    # Show first 1000 characters
    print("\nFirst 1000 characters of cleaned content:")
    print("=" * 50)
    print(cleaned[:1000])
    print("=" * 50)
    
    # Look for grant patterns
    grant_patterns = [
        r'([A-Z][A-Z\s&]+(?:Grant|Program|Award|Fund|Scholarship|Foundation))',
        r'([A-Z][a-zA-Z\s&]+(?:Grant|Program|Award|Fund|Scholarship|Foundation))',
        r'(DonorsChoose)',
        r'(Voya)',
        r'(Unsung Heroes)',
    ]
    
    print("\nSearching for grant patterns:")
    for pattern in grant_patterns:
        matches = re.findall(pattern, cleaned)
        if matches:
            print(f"Pattern '{pattern}': {len(matches)} matches")
            for match in matches[:5]:  # Show first 5 matches
                print(f"  - {match}")
        else:
            print(f"Pattern '{pattern}': No matches")
    
    # Look for section headers
    print("\nLooking for section headers:")
    lines = cleaned.split('\n')
    for i, line in enumerate(lines[:50]):  # Check first 50 lines
        if line.strip() and len(line.strip()) > 10:
            print(f"Line {i}: {line.strip()[:100]}")

if __name__ == "__main__":
    debug_rtf()
