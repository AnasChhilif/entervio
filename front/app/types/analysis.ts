export interface AnalysisData {
    match_score: number;
    total_keywords: number;
    found_keywords: string[];
    missing_keywords: string[];
    ats_score: number;
    ats_issues: string[];
    ats_recommendations: string[];
    strategic_critique: string[];
}
