#!/usr/bin/env python3
"""
Setup script for the web scraping and data processing system
"""

import os
import sys
import subprocess
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_requirements():
    """Install Python requirements for scraping"""
    logger.info("Installing Python requirements...")
    
    requirements = [
        "requests==2.31.0",
        "beautifulsoup4==4.12.2",
        "selenium==4.15.2",
        "pandas==2.1.3",
        "python-dateutil==2.8.2",
        "lxml==4.9.3",
        "fake-useragent==1.4.0",
        "schedule==1.2.0",
        "scikit-learn==1.3.2",
        "numpy==1.24.3"
    ]
    
    for requirement in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", requirement])
            logger.info(f"Installed {requirement}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install {requirement}: {e}")

def create_directories():
    """Create necessary directories"""
    logger.info("Creating directories...")
    
    directories = [
        "data",
        "data/scraped",
        "data/processed",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")

def create_config_files():
    """Create configuration files"""
    logger.info("Creating configuration files...")
    
    # Scraping configuration
    config = {
        "scraping": {
            "delay_between_requests": 1.0,
            "max_retries": 3,
            "timeout": 10,
            "user_agents": [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
            ]
        },
        "ai_matching": {
            "min_similarity_threshold": 0.1,
            "max_recommendations": 10,
            "enable_ml_matching": True
        },
        "data_processing": {
            "remove_duplicates": True,
            "validate_required_fields": True,
            "normalize_text": True
        }
    }
    
    import json
    with open("config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    logger.info("Created config.json")

def create_sample_scrapers():
    """Create sample scraper implementations"""
    logger.info("Creating sample scrapers...")
    
    # This would create additional scraper files
    # For now, we'll just log that they should be created
    scrapers_to_create = [
        "donors_choose_scraper.py",
        "adopt_a_classroom_scraper.py",
        "education_grant_scraper.py",
        "foundation_scraper.py"
    ]
    
    for scraper in scrapers_to_create:
        logger.info(f"Sample scraper to implement: {scraper}")

def create_data_validation():
    """Create data validation scripts"""
    logger.info("Creating data validation scripts...")
    
    validation_script = '''#!/usr/bin/env python3
"""
Data validation script for scraped scholarship data
"""

import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

def validate_scholarship_data(scholarship: Dict) -> List[str]:
    """Validate a single scholarship record"""
    errors = []
    
    # Required fields
    required_fields = ['title', 'description', 'organization', 'amount', 'eligibility', 'application']
    for field in required_fields:
        if field not in scholarship:
            errors.append(f"Missing required field: {field}")
    
    # Validate amount
    if 'amount' in scholarship:
        amount = scholarship['amount']
        if not isinstance(amount, dict):
            errors.append("Amount must be a dictionary")
        else:
            if 'min' not in amount or 'max' not in amount:
                errors.append("Amount must have min and max values")
            elif amount['min'] < 0 or amount['max'] < 0:
                errors.append("Amount values must be positive")
            elif amount['min'] > amount['max']:
                errors.append("Min amount cannot be greater than max amount")
    
    # Validate eligibility
    if 'eligibility' in scholarship:
        eligibility = scholarship['eligibility']
        if not isinstance(eligibility, dict):
            errors.append("Eligibility must be a dictionary")
        else:
            required_eligibility = ['gradeLevels', 'subjects', 'fundingTypes']
            for field in required_eligibility:
                if field not in eligibility:
                    errors.append(f"Missing eligibility field: {field}")
                elif not isinstance(eligibility[field], list):
                    errors.append(f"Eligibility {field} must be a list")
    
    return errors

def validate_dataset(data: List[Dict]) -> Dict:
    """Validate entire dataset"""
    total_records = len(data)
    valid_records = 0
    all_errors = []
    
    for i, scholarship in enumerate(data):
        errors = validate_scholarship_data(scholarship)
        if errors:
            all_errors.append(f"Record {i}: {', '.join(errors)}")
        else:
            valid_records += 1
    
    return {
        "total_records": total_records,
        "valid_records": valid_records,
        "invalid_records": total_records - valid_records,
        "errors": all_errors
    }

if __name__ == "__main__":
    # Load and validate data
    with open("data/processed_scholarships.json", "r") as f:
        data = json.load(f)
    
    results = validate_dataset(data)
    print(f"Validation Results:")
    print(f"Total records: {results['total_records']}")
    print(f"Valid records: {results['valid_records']}")
    print(f"Invalid records: {results['invalid_records']}")
    
    if results['errors']:
        print("Errors found:")
        for error in results['errors'][:10]:  # Show first 10 errors
            print(f"  - {error}")
'''
    
    with open("validate_data.py", "w") as f:
        f.write(validation_script)
    
    logger.info("Created validate_data.py")

def main():
    """Main setup function"""
    logger.info("Setting up web scraping system...")
    
    try:
        install_requirements()
        create_directories()
        create_config_files()
        create_sample_scrapers()
        create_data_validation()
        
        logger.info("Setup complete!")
        logger.info("Next steps:")
        logger.info("1. Run 'python scrapers/scraper_manager.py' to start scraping")
        logger.info("2. Run 'python scripts/process_scraped_data.py' to process data")
        logger.info("3. Run 'python validate_data.py' to validate processed data")
        
    except Exception as e:
        logger.error(f"Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
