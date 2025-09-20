/**
 * Simple AI Matching System for Scholarships
 * Provides basic matching without Python dependencies
 */

class SimpleMatcher {
  constructor() {
    this.matchWeights = {
      gradeLevel: 0.3,
      subject: 0.25,
      district: 0.2,
      fundingType: 0.15,
      amount: 0.1
    };
  }

  /**
   * Calculate match score for a scholarship based on user profile
   */
  calculateMatchScore(scholarship, userProfile) {
    let totalScore = 0;
    let maxScore = 0;

    // Grade Level Matching
    const gradeScore = this.matchGradeLevels(scholarship.eligibility.gradeLevels, userProfile.gradeLevel);
    totalScore += gradeScore * this.matchWeights.gradeLevel;
    maxScore += this.matchWeights.gradeLevel;

    // Subject Matching
    const subjectScore = this.matchSubjects(scholarship.eligibility.subjects, userProfile.subjects);
    totalScore += subjectScore * this.matchWeights.subject;
    maxScore += this.matchWeights.subject;

    // District Matching
    const districtScore = this.matchDistricts(scholarship.eligibility.districts, userProfile.schoolDistrict);
    totalScore += districtScore * this.matchWeights.district;
    maxScore += this.matchWeights.district;

    // Funding Type Matching
    const fundingScore = this.matchFundingTypes(scholarship.eligibility.fundingTypes, userProfile.fundingNeeds);
    totalScore += fundingScore * this.matchWeights.fundingType;
    maxScore += this.matchWeights.fundingType;

    // Amount Matching
    const amountScore = this.matchAmount(scholarship.amount, userProfile.preferredAmount);
    totalScore += amountScore * this.matchWeights.amount;
    maxScore += this.matchWeights.amount;

    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  matchGradeLevels(scholarshipGrades, userGrade) {
    if (!userGrade || scholarshipGrades.includes('Any')) return 1;
    
    const userGradeNum = this.gradeToNumber(userGrade);
    if (userGradeNum === null) return 0.5;

    // Check if user's grade is in scholarship grades
    for (const grade of scholarshipGrades) {
      if (grade === 'Any') return 1;
      if (grade === userGrade) return 1;
      
      // Check grade ranges like "6-12"
      if (grade.includes('-')) {
        const [min, max] = grade.split('-').map(g => this.gradeToNumber(g));
        if (min !== null && max !== null && userGradeNum >= min && userGradeNum <= max) {
          return 1;
        }
      }
    }
    
    return 0.3; // Partial match for different grades
  }

  matchSubjects(scholarshipSubjects, userSubjects) {
    if (!userSubjects || userSubjects.length === 0 || scholarshipSubjects.includes('Any')) return 1;
    
    const matches = userSubjects.filter(subject => 
      scholarshipSubjects.includes(subject)
    ).length;
    
    return matches / userSubjects.length;
  }

  matchDistricts(scholarshipDistricts, userDistrict) {
    if (!userDistrict || scholarshipDistricts.includes('National') || scholarshipDistricts.includes('Any')) return 1;
    
    return scholarshipDistricts.includes(userDistrict) ? 1 : 0.2;
  }

  matchFundingTypes(scholarshipFunding, userFunding) {
    if (!userFunding || userFunding.length === 0) return 0.5;
    
    const matches = userFunding.filter(funding => 
      scholarshipFunding.includes(funding)
    ).length;
    
    return matches / userFunding.length;
  }

  matchAmount(scholarshipAmount, userPreferredAmount) {
    if (!userPreferredAmount) return 0.5;
    
    const scholarshipMin = scholarshipAmount.min;
    const scholarshipMax = scholarshipAmount.max;
    const userMin = userPreferredAmount.min || 0;
    const userMax = userPreferredAmount.max || 1000000;
    
    // Check if there's overlap in amount ranges
    if (userMin <= scholarshipMax && userMax >= scholarshipMin) {
      return 1;
    }
    
    // Partial match based on how close the ranges are
    const distance = Math.min(
      Math.abs(userMin - scholarshipMax),
      Math.abs(userMax - scholarshipMin)
    );
    
    return Math.max(0, 1 - distance / 10000); // Normalize by 10k
  }

  gradeToNumber(grade) {
    if (grade === 'K' || grade === 'Kindergarten') return 0;
    if (grade === 'Pre-K') return -1;
    
    const num = parseInt(grade);
    return isNaN(num) ? null : num;
  }

  /**
   * Score all scholarships for a user profile
   */
  scoreAllScholarships(userProfile, scholarships) {
    return scholarships.map(scholarship => {
      const matchScore = this.calculateMatchScore(scholarship, userProfile);
      const overallScore = matchScore;
      
      let matchLevel;
      if (overallScore >= 0.8) matchLevel = 'High';
      else if (overallScore >= 0.6) matchLevel = 'Medium';
      else if (overallScore >= 0.4) matchLevel = 'Low';
      else matchLevel = 'Very Low';

      return {
        ...scholarship,
        matchScore: Math.round(matchScore * 100) / 100,
        overallScore: Math.round(overallScore * 100) / 100,
        matchLevel: matchLevel,
        semanticScore: matchScore, // Same as match score for simplicity
        successPrediction: Math.min(0.9, matchScore + 0.1) // Slightly optimistic
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }
}

module.exports = SimpleMatcher;
