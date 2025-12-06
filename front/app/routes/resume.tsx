import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/resume";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useSetupStore } from "~/services/usesetupstore";
import { authApi } from "~/lib/api";
import { Loader2, Upload, CheckCircle, RefreshCw } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Importer votre CV - Entervio" },
    { name: "description", content: "Téléchargez votre CV pour une analyse personnalisée" },
  ];
}

export default function ResumeUpload() {
  const navigate = useNavigate();
  const {
    isUploading,
    error,
    uploadResume,
  } = useSetupStore();

  const [hasExistingResume, setHasExistingResume] = useState<boolean | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check if user already has a resume on mount
  useEffect(() => {
    async function checkResume() {
      try {
        const user = await authApi.getMe();
        setHasExistingResume(user.has_resume);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setHasExistingResume(false);
      }
    }
    checkResume();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        await uploadResume(file);
        setJustUploaded(true);
        setHasExistingResume(true);
        setCountdown(5);
      }
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }
    const id = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate]);

  // Loading state while checking
  if (hasExistingResume === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {hasExistingResume ? "Mettre à jour votre CV" : "Importer votre CV"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            {hasExistingResume
              ? "Vous avez déjà un CV enregistré. Vous pouvez le remplacer en téléchargeant un nouveau fichier."
              : "Téléchargez votre CV au format PDF pour que nous puissions analyser vos compétences et votre expérience."
            }
          </p>

          <div className="space-y-4">
            {justUploaded ? (
              <div className="flex flex-col items-center gap-2 py-4 border rounded-md border-emerald-500/40 bg-emerald-500/5">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <p className="text-sm font-medium text-emerald-600">
                  CV {hasExistingResume ? "mis à jour" : "analysé"} avec succès.
                </p>
                {countdown !== null && (
                  <p className="text-xs text-muted-foreground">
                    Redirection vers l'accueil dans {countdown}s...
                  </p>
                )}
              </div>
            ) : (
              <>
                <Input
                  id="resume-upload-button"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant={hasExistingResume ? "secondary" : "outline"}
                  className="w-full flex items-center justify-center gap-2 h-12"
                  asChild
                  disabled={isUploading}
                >
                  <label htmlFor="resume-upload-button" className="cursor-pointer w-full flex items-center justify-center gap-2">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyse du CV...</span>
                      </>
                    ) : hasExistingResume ? (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Remplacer mon CV (PDF)</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Sélectionner un CV (PDF)</span>
                      </>
                    )}
                  </label>
                </Button>
              </>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center" aria-live="polite">
              {error}
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Vous pourrez ensuite configurer un entretien personnalisé depuis la page
            d'accueil.
          </p>

          <p className="text-xs text-muted-foreground text-center mt-2">
            <Link to="/" className="underline hover:text-primary transition-colors">
              Retour à l'accueil
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

