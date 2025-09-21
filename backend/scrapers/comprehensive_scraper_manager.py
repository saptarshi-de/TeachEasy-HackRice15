#!/usr/bin/env python3
"""
Comprehensive scraper manager for grants and scholarships
Orchestrates scraping, LLM processing, and database import
"""

import os
import sys
import json
import logging
from datetime import datetime
import subprocess

# Add the scrapers directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from grants_scholarships_scraper import GrantsScholarshipsScraper
from llm_processor import LLMOpportunityProcessor

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ComprehensiveScraperManager:
    def __init__(self):
        self.scraper = GrantsScholarshipsScraper()
        self.processor = LLMOpportunityProcessor()
        self.data_dir = "data"
        
        # Ensure data directory exists
        os.makedirs(self.data_dir, exist_ok=True)
    
    def run_comprehensive_scraping(self):
        """Run the complete scraping and processing pipeline"""
        logger.info("Starting comprehensive scraping pipeline...")
        
        try:
            # Step 1: Scrape all sources
            logger.info("Step 1: Scraping opportunities from all sources...")
            raw_opportunities = self.scraper.scrape_all()
            
            if not raw_opportunities:
                logger.error("No opportunities scraped. Exiting.")
                return None
            
            # Save raw data
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            raw_filename = f"raw_scraped_opportunities_{timestamp}.json"
            raw_filepath = os.path.join(self.data_dir, raw_filename)
            
            with open(raw_filepath, 'w', encoding='utf-8') as f:
                json.dump(raw_opportunities, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Raw data saved to {raw_filepath}")
            
            # Step 2: Process with LLM-like enhancements
            logger.info("Step 2: Processing opportunities with LLM-like enhancements...")
            processed_opportunities = self.processor.process_opportunities(raw_opportunities)
            
            # Save processed data
            processed_filename = f"processed_opportunities_{timestamp}.json"
            processed_filepath = os.path.join(self.data_dir, processed_filename)
            
            with open(processed_filepath, 'w', encoding='utf-8') as f:
                json.dump(processed_opportunities, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Processed data saved to {processed_filepath}")
            
            # Step 3: Generate summary
            summary = self.processor.generate_summary(processed_opportunities)
            summary_filename = f"scraping_summary_{timestamp}.json"
            summary_filepath = os.path.join(self.data_dir, summary_filename)
            
            with open(summary_filepath, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Summary saved to {summary_filepath}")
            
            # Step 4: Create import script
            import_script = self.create_import_script(processed_opportunities, timestamp)
            import_filename = f"import_opportunities_{timestamp}.js"
            import_filepath = os.path.join(self.data_dir, import_filename)
            
            with open(import_filepath, 'w', encoding='utf-8') as f:
                f.write(import_script)
            
            logger.info(f"Import script created: {import_filepath}")
            
            # Print summary
            self.print_summary(summary, processed_opportunities)
            
            return {
                'raw_file': raw_filepath,
                'processed_file': processed_filepath,
                'summary_file': summary_filepath,
                'import_script': import_filepath,
                'opportunities': processed_opportunities
            }
            
        except Exception as e:
            logger.error(f"Error in comprehensive scraping: {e}")
            return None
    
    def create_import_script(self, opportunities, timestamp):
        """Create a Node.js import script for the processed opportunities"""
        script_content = f'''const mongoose = require('mongoose');
const Scholarship = require('../models/Scholarship');
require('dotenv').config();

// Processed opportunities data (timestamp: {timestamp})
const opportunities = {json.dumps(opportunities, indent=2)};

async function importOpportunities() {{
    try {{
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/teacheasy');
        console.log('✅ Connected to MongoDB');

        // Import opportunities (this will add to existing data, not replace)
        const importedOpportunities = await Scholarship.insertMany(opportunities);
        console.log(`✅ Imported ${{importedOpportunities.length}} opportunities`);

        // Print summary
        const grants = opportunities.filter(op => op.type === 'grant');
        const scholarships = opportunities.filter(op => op.type === 'scholarship');
        
        console.log('\\n📊 Import Summary:');
        console.log(`Total opportunities: ${{opportunities.length}}`);
        console.log(`Grants: ${{grants.length}}`);
        console.log(`Scholarships: ${{scholarships.length}}`);
        
        console.log('\\n📋 Sample imported opportunities:');
        opportunities.slice(0, 5).forEach((op, index) => {{
            console.log(`${{index + 1}}. ${{op.title}} (${{op.type}}) - ${{op.source}}`);
        }});

        console.log('\\n🚀 Import completed successfully!');
        console.log('📖 API endpoints:');
        console.log('   All opportunities: http://localhost:5001/api/scholarships');
        console.log('   Grants only: http://localhost:5001/api/scholarships?type=grant');
        console.log('   Scholarships only: http://localhost:5001/api/scholarships?type=scholarship');

    }} catch (error) {{
        console.error('❌ Error importing opportunities:', error);
    }} finally {{
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }}
}}

// Run the import
importOpportunities();
'''
        return script_content
    
    def print_summary(self, summary, opportunities):
        """Print a comprehensive summary of the scraping results"""
        print("\n" + "="*60)
        print("🎯 COMPREHENSIVE SCRAPING SUMMARY")
        print("="*60)
        
        print(f"📊 Total Opportunities: {summary['total_opportunities']}")
        print(f"💰 Grants: {summary['grants']}")
        print(f"🎓 Scholarships: {summary['scholarships']}")
        print(f"📅 Processed: {summary['date_processed']}")
        
        print(f"\n📚 Sources:")
        for source in summary['sources']:
            print(f"   • {source}")
        
        print(f"\n🔍 Sample Opportunities:")
        for i, op in enumerate(opportunities[:5]):
            print(f"   {i+1}. {op['title']} ({op['type']}) - {op['source']}")
        
        print(f"\n📁 Files Created:")
        print(f"   • Raw data: data/raw_scraped_opportunities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        print(f"   • Processed data: data/processed_opportunities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        print(f"   • Import script: data/import_opportunities_{datetime.now().strftime('%Y%m%d_%H%M%S')}.js")
        
        print(f"\n🚀 Next Steps:")
        print(f"   1. Run the import script to add opportunities to database")
        print(f"   2. Update frontend to handle grants vs scholarships toggle")
        print(f"   3. Test the new filtering functionality")
        
        print("="*60)
    
    def run_import(self, import_script_path):
        """Run the import script to add opportunities to the database"""
        try:
            logger.info(f"Running import script: {import_script_path}")
            result = subprocess.run(['node', import_script_path], 
                                  capture_output=True, text=True, cwd='..')
            
            if result.returncode == 0:
                logger.info("Import completed successfully!")
                print(result.stdout)
            else:
                logger.error(f"Import failed: {result.stderr}")
                print(result.stderr)
                
        except Exception as e:
            logger.error(f"Error running import script: {e}")

if __name__ == "__main__":
    manager = ComprehensiveScraperManager()
    
    # Run comprehensive scraping
    result = manager.run_comprehensive_scraping()
    
    if result:
        print(f"\n✅ Scraping completed successfully!")
        print(f"📁 Files created in data/ directory")
        print(f"🚀 Ready to import to database")
        
        # Ask if user wants to import immediately
        import_choice = input("\nWould you like to import the opportunities to the database now? (y/n): ")
        if import_choice.lower() == 'y':
            manager.run_import(result['import_script'])
    else:
        print("❌ Scraping failed. Check logs for details.")
