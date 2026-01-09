import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { FileText, Mail, Mic, Sparkles } from "lucide-react";
import { useJobsStore } from "~/services/jobs-store";
import { useSetupStore } from "~/services/usesetupstore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { PDFPreviewDialog } from "../../components/PDFPreviewDialog";

interface JobActionButtonsProps {
  jobDescription: string;
  jobTitle: string;
}

export function JobActionButtons({
  jobDescription,
  jobTitle,
}: JobActionButtonsProps) {
  const navigate = useNavigate();
  const tailorResume = useJobsStore((state) => state.tailorResume);
  const generateCoverLetter = useJobsStore(
    (state) => state.generateCoverLetter
  );

  return (
    <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PDFPreviewDialog
          trigger={
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-6 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Adapter mon CV
            </Button>
          }
          title="CV Sur-Mesure"
          description="Générez une version de votre CV parfaitement alignée avec ce poste."
          idleTitle="Prêt à impressionner ?"
          idleDescription={`Notre IA va analyser l'offre ${jobTitle} et réécrire votre CV pour mettre en avant vos expériences les plus pertinentes.`}
          idleIcon={<Sparkles className="w-10 h-10 text-emerald-500" />}
          loadingMessages={[
            "Analyse de l'offre...",
            "Extraction des compétences clés...",
            "Adaptation du profil...",
            "Rédaction des accroches...",
            "Génération du PDF...",
          ]}
          onGenerate={() => tailorResume(jobDescription)}
          downloadFilename={`CV_Tailored_${jobTitle.replace(/[^a-z0-9]/gi, "_").substring(0, 20)}.pdf`}
          accentColor="emerald"
        />

        <PDFPreviewDialog
          trigger={
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-6 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Générer Lettre de Motivation
            </Button>
          }
          title="Lettre de Motivation Personnalisée"
          description="Générez une lettre de motivation en français adaptée à ce poste."
          idleTitle="Lettre professionnelle en un clic"
          idleDescription={`Notre IA va analyser l'offre ${jobTitle} et rédiger une lettre de motivation convaincante qui met en valeur votre profil et votre motivation.`}
          idleIcon={<Mail className="w-10 h-10 text-blue-500" />}
          loadingMessages={[
            "Analyse de l'offre d'emploi...",
            "Identification des points clés...",
            "Extraction des informations de l'entreprise...",
            "Rédaction de la lettre personnalisée...",
            "Mise en forme professionnelle...",
            "Génération du PDF...",
          ]}
          onGenerate={() => generateCoverLetter(jobDescription)}
          downloadFilename={`Lettre_Motivation_${jobTitle.replace(/[^a-z0-9]/gi, "_").substring(0, 20)}.pdf`}
          accentColor="blue"
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-6 border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 hover:text-indigo-800 transition-all md:col-span-2 shadow-sm"
            >
              <Mic className="w-4 h-4 mr-2" />
              Simuler un entretien
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
              <div className="mx-auto bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                <Mic className="w-6 h-6 text-indigo-600" />
              </div>
              <AlertDialogTitle className="text-center font-serif text-2xl">
                Commencer une simulation ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-base">
                Vous allez être redirigé vers l'espace de configuration
                d'entretien. La description de ce poste sera automatiquement
                utilisée pour personnaliser la simulation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
              <AlertDialogCancel className="rounded-full px-8 h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors mt-0">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  useSetupStore.getState().setJobDescription(jobDescription);
                  navigate("/setup");
                }}
                className="rounded-full px-8 h-12 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
              >
                Commencer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}