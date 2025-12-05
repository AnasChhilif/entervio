import { create } from "zustand";
import { interviewApi, ApiError } from "~/lib/api";
import type { InterviewSummary } from "~/lib/api";

interface FeedbackStore {
  summary: InterviewSummary | null;
  loading: boolean;
  error: string | null;
  fetchSummary: (interviewId: string) => Promise<void>;
  reset: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  summary: null,
  loading: true,
  error: null,

  fetchSummary: async (interviewId: string) => {
    if (!interviewId) {
      set({ error: "ID d'entretien manquant", loading: false });
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await interviewApi.getInterviewSummary(interviewId);

      let finalSummary: InterviewSummary;

      // Check if we have legacy data (feedback string but no score)
      if (data && typeof (data as any).feedback === 'string' && (data as any).score === undefined) {
        const feedbackString = (data as any).feedback;
        try {
          const parsed = JSON.parse(feedbackString);
          finalSummary = {
            ...data,
            ...parsed,
            questions: (data as any).questions || []
          } as InterviewSummary;
        } catch (e) {
          // Legacy text feedback that isn't JSON
          finalSummary = {
            score: 0,
            strengths: [],
            weaknesses: [],
            tips: [],
            overall_comment: feedbackString,
            questions: (data as any).questions || []
          } as InterviewSummary;
        }
      } else if (data && (data as any).score !== undefined) {
        // New format already
        finalSummary = data;
      } else {
        // Unexpected format or null data
        finalSummary = {
          score: 0,
          strengths: [],
          weaknesses: [],
          tips: [],
          overall_comment: "Feedback non disponible ou dans un format inattendu.",
          questions: []
        } as InterviewSummary;
      }

      set({ summary: finalSummary, loading: false });
    } catch (err) {
      console.error("Error fetching summary:", err);

      if (err instanceof ApiError) {
        set({
          error: err.status === 404
            ? "Résumé non trouvé"
            : `Erreur: ${err.status}`,
          loading: false,
        });
      } else {
        set({
          error: err instanceof Error ? err.message : "Erreur lors du chargement",
          loading: false,
        });
      }
    }
  },

  reset: () => {
    set({
      summary: null,
      loading: true,
      error: null,
    });
  },
}));