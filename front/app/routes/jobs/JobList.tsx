import { cn } from "~/lib/utils";
import { type JobOffer } from "~/services/jobs-store";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: JobOffer[];
  selectedJobId: string | null;
  onJobClick: (jobId: string) => void;
  className?: string;
}

export function JobList({
  jobs,
  selectedJobId,
  onJobClick,
  className,
}: JobListProps) {
  return (
    <div className={cn("h-full overflow-y-auto custom-scrollbar pr-2 space-y-3 pb-20", className)}>
      <div className="mb-4 flex items-center justify-between px-1">
        <span className="text-sm font-medium text-gray-500">
          {jobs.length} résultats
        </span>
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJobId === job.id}
          onClick={() => onJobClick(job.id)}
        />
      ))}
    </div>
  );
}