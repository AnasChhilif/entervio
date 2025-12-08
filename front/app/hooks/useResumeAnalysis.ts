import { useState } from "react";
import { api } from "~/lib/api";
import type { AnalysisData } from "~/types/analysis";

export function useResumeAnalysis() {
    const [result, setResult] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analyze = async (jobDescription: string) => {
        if (!jobDescription.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.post("/resume/analyze", {
                job_description: jobDescription,
            });
            setResult(response.data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to analyze resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return { analyze, result, loading, error, setError, setResult };
}
