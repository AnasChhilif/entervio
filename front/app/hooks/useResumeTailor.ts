import { useState } from "react";
import { api, authApi } from "~/lib/api";

export function useResumeTailor() {
    const [tailoring, setTailoring] = useState(false);
    const [tailorError, setTailorError] = useState<string | null>(null);

    const generateTailoredResume = async (jobDescription: string, critique?: string[]) => {
        setTailoring(true);
        setTailorError(null);

        try {
            const user = await authApi.getMe();
            const blob = await api.postBlob("/resume/tailor", {
                user_id: user.id, // Dynamic ID

                job_description: jobDescription,
                critique: critique // Pass the critique!
            });

            // Download PDF
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tailored_resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            return true; // Success

        } catch (err: any) {
            console.error(err);
            setTailorError("Failed to generate resume. Please try again.");
            return false;
        } finally {
            setTailoring(false);
        }
    };

    return { generateTailoredResume, tailoring, tailorError, setTailorError };
}
