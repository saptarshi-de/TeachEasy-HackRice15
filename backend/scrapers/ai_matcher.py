import re
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime, timedelta

class AIMatcher:
    """AI-powered matching system for scholarships and users"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.scholarship_vectors = None
        self.scholarship_texts = []
        
    def prepare_scholarship_data(self, scholarships: List[Dict]):
        """Prepare scholarship data for AI matching"""
        self.scholarship_texts = []
        
        for scholarship in scholarships:
            # Create a comprehensive text representation
            text_parts = [
                scholarship.get('title', ''),
                scholarship.get('description', ''),
                scholarship.get('organization', ''),
                ' '.join(scholarship.get('eligibility', {}).get('subjects', [])),
                ' '.join(scholarship.get('eligibility', {}).get('gradeLevels', [])),
                ' '.join(scholarship.get('eligibility', {}).get('fundingTypes', [])),
                ' '.join(scholarship.get('tags', [])),
                scholarship.get('eligibility', {}).get('requirements', '')
            ]
            
            text = ' '.join(filter(None, text_parts))
            self.scholarship_texts.append(text)
        
        # Fit the vectorizer
        self.scholarship_vectors = self.vectorizer.fit_transform(self.scholarship_texts)
    
    def calculate_user_profile_vector(self, user_profile: Dict) -> np.ndarray:
        """Calculate user profile vector for matching"""
        profile_parts = [
            user_profile.get('schoolName', ''),
            user_profile.get('schoolDistrict', ''),
            ' '.join(user_profile.get('gradeLevel', [])),
            ' '.join(user_profile.get('subjects', [])),
            ' '.join(user_profile.get('fundingNeeds', [])),
        ]
        
        profile_text = ' '.join(filter(None, profile_parts))
        return self.vectorizer.transform([profile_text])
    
    def find_matching_scholarships(self, user_profile: Dict, scholarships: List[Dict], 
                                 top_k: int = 10) -> List[Tuple[Dict, float]]:
        """Find scholarships that match user profile"""
        if not self.scholarship_vectors is not None:
            self.prepare_scholarship_data(scholarships)
        
        user_vector = self.calculate_user_profile_vector(user_profile)
        
        # Calculate similarity scores
        similarities = cosine_similarity(user_vector, self.scholarship_vectors).flatten()
        
        # Get top matches
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        matches = []
        for idx in top_indices:
            if similarities[idx] > 0.1:  # Minimum similarity threshold
                matches.append((scholarships[idx], float(similarities[idx])))
        
        return matches
    
    def calculate_scholarship_score(self, scholarship: Dict, user_profile: Dict) -> float:
        """Calculate a comprehensive score for scholarship-user matching"""
        score = 0.0
        max_score = 0.0
        
        # Grade level matching (30% weight)
        user_grades = set(user_profile.get('gradeLevel', []))
        scholarship_grades = set(scholarship.get('eligibility', {}).get('gradeLevels', []))
        if scholarship_grades:
            grade_match = len(user_grades.intersection(scholarship_grades)) / len(scholarship_grades)
            score += grade_match * 0.3
        max_score += 0.3
        
        # Subject matching (25% weight)
        user_subjects = set(user_profile.get('subjects', []))
        scholarship_subjects = set(scholarship.get('eligibility', {}).get('subjects', []))
        if scholarship_subjects and 'Any' not in scholarship_subjects:
            subject_match = len(user_subjects.intersection(scholarship_subjects)) / len(scholarship_subjects)
            score += subject_match * 0.25
        else:
            score += 0.25  # Full score if "Any" subjects
        max_score += 0.25
        
        # Funding needs matching (20% weight)
        user_funding = set(user_profile.get('fundingNeeds', []))
        scholarship_funding = set(scholarship.get('eligibility', {}).get('fundingTypes', []))
        if scholarship_funding and 'General' not in scholarship_funding:
            funding_match = len(user_funding.intersection(scholarship_funding)) / len(scholarship_funding)
            score += funding_match * 0.2
        else:
            score += 0.2  # Full score if "General" funding
        max_score += 0.2
        
        # District matching (15% weight)
        user_district = user_profile.get('schoolDistrict', '')
        scholarship_districts = scholarship.get('eligibility', {}).get('districts', [])
        if scholarship_districts:
            if 'National' in scholarship_districts or 'Statewide' in scholarship_districts:
                score += 0.15
            elif user_district in scholarship_districts:
                score += 0.15
        else:
            score += 0.15  # Default if no district specified
        max_score += 0.15
        
        # Amount preference matching (10% weight)
        user_min = user_profile.get('preferences', {}).get('minAmount', 0)
        user_max = user_profile.get('preferences', {}).get('maxAmount', 100000)
        scholarship_min = scholarship.get('amount', {}).get('min', 0)
        scholarship_max = scholarship.get('amount', {}).get('max', 100000)
        
        if scholarship_min >= user_min and scholarship_max <= user_max:
            score += 0.1  # Perfect match
        elif scholarship_min <= user_max and scholarship_max >= user_min:
            score += 0.05  # Partial match
        max_score += 0.1
        
        # Normalize score
        return score / max_score if max_score > 0 else 0.0
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Remove common words and extract meaningful terms
        words = re.findall(r'\b[a-zA-Z]{3,}\b', text.lower())
        
        # Filter out common stop words
        stop_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these',
            'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him',
            'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
        }
        
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        return list(set(keywords))
    
    def suggest_profile_improvements(self, user_profile: Dict, scholarships: List[Dict]) -> Dict:
        """Suggest improvements to user profile based on available scholarships"""
        suggestions = {
            'missing_subjects': [],
            'missing_funding_types': [],
            'popular_grade_levels': [],
            'trending_keywords': []
        }
        
        # Analyze all scholarships
        all_subjects = set()
        all_funding_types = set()
        all_grade_levels = set()
        all_keywords = set()
        
        for scholarship in scholarships:
            all_subjects.update(scholarship.get('eligibility', {}).get('subjects', []))
            all_funding_types.update(scholarship.get('eligibility', {}).get('fundingTypes', []))
            all_grade_levels.update(scholarship.get('eligibility', {}).get('gradeLevels', []))
            
            # Extract keywords from title and description
            title_keywords = self.extract_keywords(scholarship.get('title', ''))
            desc_keywords = self.extract_keywords(scholarship.get('description', ''))
            all_keywords.update(title_keywords + desc_keywords)
        
        # Find missing subjects
        user_subjects = set(user_profile.get('subjects', []))
        missing_subjects = all_subjects - user_subjects
        suggestions['missing_subjects'] = list(missing_subjects)[:5]  # Top 5
        
        # Find missing funding types
        user_funding = set(user_profile.get('fundingNeeds', []))
        missing_funding = all_funding_types - user_funding
        suggestions['missing_funding_types'] = list(missing_funding)[:5]  # Top 5
        
        # Find popular grade levels
        grade_counts = {}
        for grade in all_grade_levels:
            grade_counts[grade] = grade_counts.get(grade, 0) + 1
        suggestions['popular_grade_levels'] = sorted(grade_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Find trending keywords
        keyword_counts = {}
        for keyword in all_keywords:
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
        suggestions['trending_keywords'] = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return suggestions
    
    def predict_application_success(self, scholarship: Dict, user_profile: Dict) -> float:
        """Predict likelihood of successful application (0-1 scale)"""
        score = 0.0
        
        # Check deadline urgency
        deadline = scholarship.get('application', {}).get('deadline')
        if deadline:
            days_until_deadline = (deadline - datetime.now()).days
            if days_until_deadline > 30:
                score += 0.2
            elif days_until_deadline > 7:
                score += 0.1
        
        # Check difficulty level
        difficulty = scholarship.get('difficulty', 'Medium')
        if difficulty == 'Easy':
            score += 0.3
        elif difficulty == 'Medium':
            score += 0.2
        else:
            score += 0.1
        
        # Check popularity (less popular = higher chance)
        popularity = scholarship.get('popularity', 50)
        if popularity < 30:
            score += 0.2
        elif popularity < 60:
            score += 0.1
        
        # Check if user has required documents
        required_docs = scholarship.get('application', {}).get('documentsRequired', [])
        if 'Resume/CV' in required_docs and user_profile.get('resumeUrl'):
            score += 0.1
        
        # Check amount range (higher amounts might be more competitive)
        amount = scholarship.get('amount', {})
        avg_amount = (amount.get('min', 0) + amount.get('max', 0)) / 2
        if avg_amount < 5000:
            score += 0.2
        elif avg_amount < 15000:
            score += 0.1
        
        return min(score, 1.0)  # Cap at 1.0
