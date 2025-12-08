
import { useState } from "react";
import type { Route } from "./+types/resume-check";
import AnalysisResult from "~/components/analysis/AnalysisResult";
import { useResumeAnalysis } from "~/hooks/useResumeAnalysis";
import { useResumeTailor } from "~/hooks/useResumeTailor";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Entervio - Resume Check" },
        { name: "description", content: "Optimize your resume for any job description." },
    ];
}

export default function ResumeCheck() {
    const [jobDescription, setJobDescription] = useState("");

    // Custom Hooks
    const { analyze, result, loading, error: analysisError } = useResumeAnalysis();
    const { generateTailoredResume, tailoring, tailorError } = useResumeTailor();

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        analyze(jobDescription);
    };

    const handleTailor = async () => {
        if (!result) return;
        await generateTailoredResume(jobDescription, result.strategic_critique);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">

            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Entervio <span className="text-slate-400 font-medium">Intelligence</span></h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="/jobs" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Find Jobs</a>
                        <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Dashboard</a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Optimization Center
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Paste a Job Description below to verify your resume's compatibility and discover missing keywords instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Input Section */}
                    <div className={`lg: col - span - 5 space - y - 6 ${result ? 'lg:sticky lg:top-24' : ''} `}>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                            <div className="p-4 border-b border-slate-50">
                                <label htmlFor="jd" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Target Job Description
                                </label>
                            </div>
                            <div className="p-2">
                                <textarea
                                    id="jd"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    className="w-full h-[400px] p-4 text-slate-600 bg-white border-none focus:ring-0 focus:outline-none resize-none text-base leading-relaxed placeholder:text-slate-300"
                                />
                            </div>
                            <div className="p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-xl flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-medium">{jobDescription.length} chars</span>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !jobDescription.trim()}
                                    className={`
inline - flex items - center justify - center px - 6 py - 2.5 rounded - lg text - sm font - semibold transition - all duration - 200 shadow - sm
                                ${loading || !jobDescription.trim()
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
                                        }
`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Analyzing...
                                        </>
                                    ) : (
                                        "Run Analysis"
                                    )}
                                </button>
                            </div>
                        </div>

                        {analysisError && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start animate-in fade-in slide-in-from-top-2">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {analysisError}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-7 space-y-6">
                        {result ? (
                            <>
                                <AnalysisResult data={result} />

                                {/* TAILOR ACTION CARD */}
                                <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Apply with confidence</h3>
                                            <p className="text-slate-400 mt-2 max-w-md">
                                                Generate a tailored resume PDF that specifically addresses the strategic critique and keyword gaps found above.
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleTailor}
                                            disabled={tailoring}
                                            className={`
flex - shrink - 0 inline - flex items - center px - 6 py - 3 rounded - lg text - sm font - bold text - slate - 900 transition - all duration - 200
                                        ${tailoring
                                                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                                                    : 'bg-emerald-400 hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:-translate-y-0.5 active:translate-y-0'
                                                }
`}
                                        >
                                            {tailoring ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Generrating PDF...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    Generate Tailored Resume
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {tailorError && (
                                        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                            {tailorError}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 text-slate-400">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Ready to Optimize</h3>
                                <p className="max-w-xs mt-2">Paste a job description on the left to see how your resume scores.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

