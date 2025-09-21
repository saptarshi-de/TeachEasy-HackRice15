#!/bin/bash

echo "🚀 Starting Grants and Scholarships Scraper..."

# Activate virtual environment
source scraper_env/bin/activate

# Run the comprehensive scraper
python3 scrapers/comprehensive_scraper_manager.py

echo "✅ Scraping completed!"
