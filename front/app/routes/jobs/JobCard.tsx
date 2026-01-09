import { ArrowRight, Sparkles } from "lucide-react";
import { formatSalary } from "~/lib/salary-utils";
import { cn } from "~/lib/utils";
import { useJobsStore, type JobOffer } from "~/services/jobs-store";

interface JobCardProps {
  job: JobOffer;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const trackJobView = useJobsStore((state) => state.trackJobView);

  const handleClick = async () => {
    if (!job.is_viewed) {
      await trackJobView(job);
    }
    onClick();
  };

  const matchTextColor =
    job.relevance_score && job.relevance_score >= 80
      ? "text-emerald-600"
      : "text-yellow-600";

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative p-5 transition-all duration-200 cursor-pointer hover:bg-gray-50",
        isSelected ? "bg-white" : "bg-white",
        "border-b border-gray-100 last:border-0"
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-colors",
          isSelected ? "bg-primary" : "bg-transparent group-hover:bg-gray-200"
        )}
      />

      <div className="flex justify-between items-center gap-3 mb-1">
        <h3
          className={cn(
            "font-bold text-lg leading-tight transition-colors text-gray-900 flex-1 min-w-0",
            isSelected && "text-primary"
          )}
        >
          {job.intitule}
        </h3>

        <div className="flex items-center gap-2">
          {job.relevance_score !== undefined && (
            <div
              className={cn(
                "shrink-0 font-bold text-sm flex items-center gap-1",
                matchTextColor
              )}
            >
              {job.relevance_score}% Match
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-500 font-medium mb-3">
        <span className="uppercase tracking-wide text-xs font-bold text-gray-400">
          {job.entreprise?.nom || "Confidentiel"}
        </span>
        <span className="text-gray-300">·</span>
        <span>{job.lieuTravail.libelle}</span>
        <span className="text-gray-300">·</span>
        <span>{job.typeContrat}</span>
        {job.salaire?.libelle && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-gray-700">
              {formatSalary(job.salaire.libelle)}
            </span>
          </>
        )}
      </div>

      {job.relevance_reasoning && (
        <div className="flex items-start gap-2 text-sm text-gray-600 font-bold leading-relaxed mb-6">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{job.relevance_reasoning}</p>
        </div>
      )}

      <div className="absolute right-4 bottom-4 flex items-center gap-2">
        {job.is_applied && (
          <span className="shrink-0 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
            Déjà postulé
          </span>
        )}
        {job.is_viewed && !job.is_applied && (
          <span className="shrink-0 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full border border-blue-200">
            Vu
          </span>
        )}
        <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}