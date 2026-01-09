import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Building2,
  Briefcase,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useJobsStore, type JobOffer } from "~/services/jobs-store";
import { JobActionButtons } from "./JobActionButtons";
import { formatSalary } from "~/lib/salary-utils";

interface JobDetailProps {
  job: JobOffer | null;
  onBack: () => void;
}

export function JobDetail({ job, onBack }: JobDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackJobApplication = useJobsStore(
    (state) => state.trackJobApplication
  );

  useEffect(() => {
    if (job?.id && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [job?.id]);

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-gray-300" />
        </div>

        <p className="text-lg font-medium text-gray-900">
          Sélectionnez une offre
        </p>

        <p className="text-sm mt-1">
          Cliquez sur une offre à gauche pour voir les détails.
        </p>
      </div>
    );
  }

  const applyUrl =
    job.urlPartner ||
    job.contact?.urlPostulation ||
    job.origineOffre?.urlOrigine;

  const handlePostulerClick = async () => {
    if (!applyUrl) return;

    window.open(applyUrl, "_blank", "noopener,noreferrer");

    try {
      await trackJobApplication(job.id);
    } catch (error) {
      console.error("Failed to track application:", error);
    }
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "bg-white border-gray-100 shadow-sm",
        "lg:h-full lg:overflow-y-auto lg:rounded-2xl lg:border",
        "h-full overflow-y-auto w-full relative"
      )}
    >
      <Button
        onClick={onBack}
        variant="ghost"
        className="lg:hidden absolute top-2 left-2 z-10 h-10 w-10 p-0 text-gray-600"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <div className="h-32 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="px-8 pb-12 -mt-12 relative">
        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center mb-6">
          <Building2 className="w-10 h-10 text-gray-800" />
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            {job.is_applied && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
                <CheckCircle className="w-4 h-4" />
                Vous avez postulé à cette offre
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
              {job.intitule}
            </h1>
            <div className="flex items-center gap-2 text-lg text-gray-600">
              <span className="font-medium">
                {job.entreprise?.nom || "Entreprise confidentielle"}
              </span>
              <span>•</span>
              <span>{job.lieuTravail.libelle}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
            <JobActionButtons
              jobDescription={job.description}
              jobTitle={job.intitule}
            />

            {applyUrl && (
              <Button
                onClick={handlePostulerClick}
                size="lg"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 h-12 text-base font-medium transition-transform hover:-translate-y-0.5"
              >
                Postuler
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {job.relevance_reasoning && (
          <div className="mb-10 p-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
                Pourquoi ça matche
              </h3>
              {job.relevance_score !== undefined && (
                <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {job.relevance_score}% Match
                </span>
              )}
            </div>
            <div className="prose prose-sm max-w-none text-emerald-900/80 leading-relaxed">
              <p>{job.relevance_reasoning}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Contrat
            </p>
            <p className="font-semibold text-gray-900">{job.typeContrat}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Salaire
            </p>
            <p className="font-semibold text-gray-900">
              {job.salaire?.libelle
                ? formatSalary(job.salaire.libelle)
                : "Non spécifié"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Expérience
            </p>
            <p className="font-semibold text-gray-900">Non spécifié</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Publié le
            </p>
            <p className="font-semibold text-gray-900">
              {new Date(job.dateCreation).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <h3 className=" font-bold text-gray-900 text-xl mb-4">
            Description du poste
          </h3>
          <p className="whitespace-pre-line">{job.description}</p>
        </div>
      </div>
    </div>
  );
}