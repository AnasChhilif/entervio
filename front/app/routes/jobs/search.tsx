import { useState } from "react";
import { cn } from "~/lib/utils";
import { useJobsStore } from "~/services/jobs-store";
import { JobSearchHeader } from "./JobSearchHeader";
import { JobList } from "./JobList";
import { JobDetail } from "./JobDetail";
import { EmptyState } from "./EmptyState";

export default function JobsSearch() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const currentJobs = useJobsStore((state) => state.currentJobs ?? []);
  const isLoading = useJobsStore((state) => state.isLoading ?? false);
  const hasSearched = useJobsStore((state) => state.hasSearched ?? false);
  const smartSearch = useJobsStore((state) => state.smartSearch);

  const selectedJob = currentJobs.find((j) => j.id === selectedJobId) || null;
  const showDetail = selectedJobId !== null;

  const handleJobClick = (id: string) => {
    setSelectedJobId(id);
  };

  const handleSmartSearch = async (query: string) => {
    setSelectedJobId(null);
    try {
      const results = await smartSearch(undefined, query);
      if (results.length > 0) {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        if (isDesktop) {
          setSelectedJobId(results[0].id);
        }
      }
    } catch (error) {
      console.error("Smart search failed:", error);
    }
  };

  return (
    <div className="h-full bg-[#FAFAFA] text-gray-900 font-sans flex flex-col overflow-hidden">
      <JobSearchHeader isLoading={isLoading} onSearch={handleSmartSearch} />

      <div className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto p-4 md:p-6">
        {currentJobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <JobList
              jobs={currentJobs}
              selectedJobId={selectedJobId}
              onJobClick={handleJobClick}
              className={cn("lg:col-span-4", { "hidden lg:block": selectedJobId })}
            />

            <div
              className={cn("lg:col-span-8 h-full overflow-hidden", {
                block: showDetail,
                "hidden lg:block": !showDetail,
              })}
            >
              <JobDetail
                job={selectedJob}
                onBack={() => setSelectedJobId(null)}
              />
            </div>
          </div>
        ) : hasSearched && !isLoading ? (
          <EmptyState type="no-results" />
        ) : !hasSearched && !isLoading ? (
          <EmptyState type="no-search" />
        ) : (
          <EmptyState type="loading" />
        )}
      </div>
    </div>
  );
}