# Web Scraping & Data Processing Guide

This guide explains how to implement and use the web scraping system for collecting real scholarship and grant data.

## 🎯 Overview

The scraping system consists of:
- **Base Scraper**: Common functionality for all scrapers
- **Education Grant Scraper**: Scrapes education-focused grants
- **AI Matcher**: Machine learning-powered matching system
- **Data Processor**: Normalizes and validates scraped data
- **Scraper Manager**: Orchestrates all scraping operations

## 🚀 Quick Start

### 1. Setup Python Environment

```bash
cd backend
python -m venv scraping_env
source scraping_env/bin/activate  # On Windows: scraping_env\Scripts\activate
pip install -r requirements.txt
```

### 2. Run Setup Script

```bash
python scripts/setup_scraping.py
```

### 3. Start Scraping

```bash
# Run all scrapers
python scrapers/scraper_manager.py

# Process scraped data
python scripts/process_scraped_data.py

# Validate processed data
python validate_data.py
```

## 🕷️ How Scraping Works

### Data Sources

The system is designed to scrape from multiple sources:

1. **Government Grants** (grants.gov, ed.gov)
2. **Foundation Websites** (NSF, private foundations)
3. **Education Platforms** (DonorsChoose, AdoptAClassroom)
4. **Corporate Programs** (company education initiatives)

### Scraping Process

1. **Discovery**: Find scholarship/grant pages
2. **Extraction**: Extract relevant data using BeautifulSoup
3. **Normalization**: Convert to standardized format
4. **Validation**: Ensure data quality
5. **Storage**: Save to MongoDB

## 🤖 AI/ML Features

### Do You Need AI/ML?

**For MVP: NO** - Simple rule-based matching is sufficient
**For Production: YES** - AI improves matching accuracy significantly

### AI Matching Features

1. **Semantic Similarity**: Uses TF-IDF and cosine similarity
2. **Profile Scoring**: Multi-factor scoring algorithm
3. **Success Prediction**: Predicts application success likelihood
4. **Recommendation Engine**: Suggests profile improvements

### AI Implementation

```python
from scrapers.ai_matcher import AIMatcher

# Initialize AI matcher
matcher = AIMatcher()

# Prepare scholarship data
matcher.prepare_scholarship_data(scholarships)

# Find matches for user
matches = matcher.find_matching_scholarships(user_profile, scholarships)

# Get AI-powered recommendations
recommendations = matcher.suggest_profile_improvements(user_profile, scholarships)
```

## 📊 Data Normalization

### Standardized Fields

All scraped data is normalized to this format:

```json
{
  "title": "Scholarship Name",
  "description": "Detailed description",
  "organization": "Granting Organization",
  "amount": {
    "min": 1000,
    "max": 5000,
    "currency": "USD"
  },
  "eligibility": {
    "gradeLevels": ["K", "1", "2", "3"],
    "subjects": ["Mathematics", "Science"],
    "districts": ["Houston ISD", "Katy ISD"],
    "fundingTypes": ["Classroom Supplies", "Technology Equipment"]
  },
  "application": {
    "deadline": "2024-12-31T23:59:59Z",
    "applicationUrl": "https://apply.example.com",
    "applicationMethod": "Online",
    "documentsRequired": ["Resume/CV", "Essay"]
  }
}
```

### Data Quality Checks

- **Required Fields**: All essential fields present
- **Amount Validation**: Min ≤ Max, positive values
- **Date Validation**: Valid deadline dates
- **Enum Validation**: Values match allowed options
- **Duplicate Detection**: Remove duplicate entries

## 🏫 District-Based Filtering

### Supported Districts

The system now supports filtering by school districts:

**Houston Area:**
- Houston ISD, Katy ISD, Cypress-Fairbanks ISD, Spring ISD, Klein ISD, Aldine ISD
- Fort Bend ISD, Alief ISD, Pasadena ISD, Clear Creek ISD, Pearland ISD

**Dallas Area:**
- Dallas ISD, Plano ISD, Richardson ISD, Garland ISD, Mesquite ISD, Irving ISD
- Frisco ISD, McKinney ISD, Allen ISD, Lewisville ISD

**Austin Area:**
- Austin ISD, Round Rock ISD, Leander ISD, Pflugerville ISD, Lake Travis ISD

**San Antonio Area:**
- San Antonio ISD, Northside ISD, North East ISD, Judson ISD, East Central ISD

**Other Major Districts:**
- Fort Worth ISD, Arlington ISD, El Paso ISD, Corpus Christi ISD, Lubbock ISD
- Amarillo ISD, Laredo ISD, Brownsville ISD, McAllen ISD, Waco ISD
- Killeen ISD, Tyler ISD, Beaumont ISD, Bryan ISD, College Station ISD

## 🔧 Customizing Scrapers

### Adding New Scrapers

1. **Create Scraper Class**:

```python
from base_scraper import BaseScraper

class MyCustomScraper(BaseScraper):
    def scrape_scholarships(self):
        # Your scraping logic here
        return scholarships
```

2. **Register in ScraperManager**:

```python
from scrapers.scraper_manager import ScraperManager

manager = ScraperManager()
manager.scrapers.append(MyCustomScraper())
```

### Scraping Best Practices

1. **Respect robots.txt**: Check website's robots.txt file
2. **Rate Limiting**: Add delays between requests (1-2 seconds)
3. **Error Handling**: Gracefully handle network errors
4. **User Agents**: Rotate user agents to avoid blocking
5. **Legal Compliance**: Ensure compliance with website terms

## 📈 Monitoring & Analytics

### Scraping Statistics

```python
from scrapers.scraper_manager import ScraperManager

manager = ScraperManager()
stats = manager.get_scraping_stats()

print(f"Total scholarships: {stats['total']}")
print(f"By organization: {stats['by_organization']}")
print(f"By difficulty: {stats['by_difficulty']}")
```

### Data Quality Metrics

- **Completeness**: Percentage of required fields filled
- **Accuracy**: Validation error rate
- **Freshness**: How recent the data is
- **Coverage**: Number of unique sources

## 🚨 Troubleshooting

### Common Issues

1. **Rate Limiting**: Increase delays between requests
2. **Blocked Requests**: Rotate user agents, use proxies
3. **Parsing Errors**: Update selectors for website changes
4. **Data Validation**: Check enum values and required fields

### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 🔄 Automated Scheduling

### Daily Scraping

```python
from scrapers.scraper_manager import ScraperManager

manager = ScraperManager()
manager.schedule_scraping(interval_hours=24)
```

### Cron Job Setup

```bash
# Add to crontab for daily scraping at 2 AM
0 2 * * * cd /path/to/backend && python scrapers/scraper_manager.py
```

## 📚 API Integration

### MongoDB Integration

```python
from pymongo import MongoClient
from models.Scholarship import Scholarship

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client.teacheasy

# Insert processed data
for scholarship in processed_data:
    db.scholarships.insert_one(scholarship)
```

### Real-time Updates

The system can be integrated with your existing API to:
- Update scholarship database automatically
- Send notifications for new opportunities
- Refresh expired scholarships
- Update popularity scores

## 🎯 Next Steps

1. **Implement More Scrapers**: Add scrapers for specific foundations
2. **Enhance AI Matching**: Add more sophisticated ML models
3. **Real-time Monitoring**: Set up alerts for scraping failures
4. **Data Visualization**: Create dashboards for scraping analytics
5. **Legal Review**: Ensure compliance with all website terms

## 📞 Support

For issues with the scraping system:
1. Check the logs in `logs/` directory
2. Run data validation to identify issues
3. Test individual scrapers in isolation
4. Review website changes that might affect parsing

---

**The scraping system is designed to be robust, scalable, and maintainable. Start with the basic scrapers and gradually add more sophisticated features as needed.**
