import React from 'react';
import type { AnalysisData } from "~/types/analysis";

interface AnalysisResultProps {
    data: AnalysisData;
}

export default function AnalysisResult({ data }: AnalysisResultProps) {
    const scoreColor = data.match_score >= 80 ? 'text-emerald-500' : data.match_score >= 50 ? 'text-amber-500' : 'text-rose-500';
    const strokeColor = data.match_score >= 80 ? '#10B981' : data.match_score >= 50 ? '#F59E0B' : '#F43F5E';

    // Calculate circle circumference for progress
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (data.match_score / 100) * circumference;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Top Cards: Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Match Score Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider relative z-10">Match Score</h3>

                    <div className="mt-4 flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className={`text-5xl font-bold tracking-tight ${scoreColor}`}>
                                {Math.round(data.match_score)}%
                            </span>
                            <span className="text-slate-400 text-sm mt-1">Relevance to Job</span>
                        </div>

                        {/* Radial Progress */}
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-slate-100"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r={radius}
                                    stroke={strokeColor}
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ATS Score Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>

                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider relative z-10">ATS Compatibility</h3>

                    <div className="mt-4 relative z-10">
                        <div className="flex items-baseline space-x-2">
                            <span className={`text-4xl font-bold tracking-tight ${data.ats_score > 90 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                {data.ats_score}
                            </span>
                            <span className="text-slate-400">/ 100</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {data.ats_issues.length === 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    Ready for Parsing
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    {data.ats_issues.length} Issues Found
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Keyword Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900">Keyword Analysis</h3>
                    <p className="text-slate-500 text-sm mt-1">Comparison of your resume vocabulary vs. job requirements.</p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Missing Keywords */}
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-rose-500 mb-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Missing Critical Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.missing_keywords.length > 0 ? (
                                data.missing_keywords.map((kw, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-rose-50 text-rose-700 border border-rose-100 dashed-border">
                                        {kw}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No critical keywords missing.</p>
                            )}
                        </div>
                    </div>

                    {/* Found Keywords */}
                    <div>
                        <h4 className="flex items-center text-sm font-semibold text-emerald-600 mb-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Matched Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.found_keywords.length > 0 ? (
                                data.found_keywords.map((kw, i) => (
                                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        {kw}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No matches found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategic Critique (Recruiter Feedback) */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-indigo-900">Strategic Recruiter Feedback</h3>
                        <p className="text-sm text-indigo-700 mt-1">AI-Recruiter evaluation of your fit beyond keywords.</p>

                        <ul className="mt-4 space-y-3">
                            {data.strategic_critique && data.strategic_critique.length > 0 ? (
                                data.strategic_critique.map((critique, i) => (
                                    <li key={i} className="flex items-start">
                                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-indigo-800 text-sm">{critique}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-sm text-indigo-500 italic">No specific strategic issues found. Good job!</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ATS Recommendations */}
            {data.ats_recommendations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-900">ATS Optimization Tips</h3>
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {data.ats_recommendations.map((rec, i) => (
                            <li key={i} className="p-6 flex items-start group hover:bg-slate-50 transition-colors">
                                <div className="flex-shrink-0 mt-1">
                                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p className="ml-4 text-sm text-slate-600 leading-relaxed group-hover:text-slate-900">{rec}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
