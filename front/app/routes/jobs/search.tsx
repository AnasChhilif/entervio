import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, MapPin, Building2, Briefcase, ExternalLink, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { jobsService, type JobOffer } from "~/services/jobs";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

function JobCard({ job }: { job: JobOffer }) {
    const [isOpen, setIsOpen] = useState(false);

    const getApplyUrl = () => {
        return job.urlPartner || job.contact?.urlPostulation || job.origineOffre?.urlOrigine;
    };

    const applyUrl = getApplyUrl();

    return (
        <div
            className={cn(
                "group bg-card rounded-xl shadow-sm hover:shadow-[var(--shadow-diffuse)] transition-all duration-300 border border-border overflow-hidden cursor-pointer hover:-translate-y-1",
                isOpen ? "ring-1 ring-primary/20 shadow-[var(--shadow-diffuse)]" : ""
            )}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="p-6 flex items-start gap-5">
                {/* Logo Placeholder */}
                <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 text-primary border border-primary/10">
                    <Building2 className="w-7 h-7" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                {job.intitule}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground font-medium">
                                    {job.entreprise?.nom || "Entreprise confidentielle"}
                                </p>
                                {job.relevance_score !== undefined && (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs">
                                        {job.relevance_score}% Match
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {applyUrl && (
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 hover:border-primary/30 shadow-none font-medium px-5 h-8 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <a
                                        href={applyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Postuler
                                    </a>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-lg">
                                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-md border border-secondary/50">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{job.lieuTravail.libelle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-md border border-secondary/50">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{job.typeContrat}</span>
                        </div>
                        {job.salaire?.libelle && (
                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground border-border bg-background">
                                {job.salaire.libelle}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isOpen && (
                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px w-full bg-border/50 mb-6" />

                    {job.relevance_reasoning && (
                        <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>Analyse IA</span>
                            </div>
                            <p className="text-sm text-emerald-900/80 leading-relaxed">
                                {job.relevance_reasoning}
                            </p>
                        </div>
                    )}

                    <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                        <p className="whitespace-pre-line">{job.description}</p>
                    </div>

                    <div className="mt-8 flex justify-end pt-4 border-t border-border/50">
                        {applyUrl && (
                            <Button asChild size="lg" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 px-8">
                                <a
                                    href={applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Postuler maintenant <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function JobsSearch() {
    const [keywords, setKeywords] = useState("");
    const [location, setLocation] = useState("");
    const [jobs, setJobs] = useState<JobOffer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchMode, setSearchMode] = useState<"standard" | "smart">("standard");

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!keywords.trim() && searchMode === "standard") return;

        setIsLoading(true);
        setJobs([]); // Clear previous results
        try {
            const results = await jobsService.search(keywords, location);
            setJobs(results);
            setSearchMode("standard");
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const handleSmartSearch = async () => {
        setIsLoading(true);
        setJobs([]); // Clear previous results
        try {
            // Smart search doesn't strictly require keywords as it uses the resume
            const results = await jobsService.smartSearch(location);
            setJobs(results);
            setSearchMode("smart");
        } catch (error) {
            console.error("Smart search failed:", error);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
            {/* Main Column */}
            <div className="w-full max-w-[800px] space-y-8">

                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-5xl font-serif font-medium text-foreground tracking-tight">
                        Opportunités
                    </h1>
                    <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                        Découvrez les offres qui correspondent à votre véritable potentiel.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-background/60 backdrop-blur-xl p-2 rounded-2xl shadow-[var(--shadow-diffuse)] border border-border/40 flex flex-col sm:flex-row gap-2 relative z-10">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Poste, entreprise, mot-clé..."
                            className="pl-12 h-14 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent rounded-xl"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <div className="h-px sm:h-auto sm:w-px bg-border/50 mx-2" />
                    <div className="relative w-full sm:w-1/3 group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Lieu (ex: Paris)"
                            className="pl-12 h-14 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent rounded-xl"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <Button
                        onClick={(e) => handleSearch(e)}
                        disabled={isLoading}
                        className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                        {isLoading && searchMode === "standard" ? "Recherche..." : "Rechercher"}
                    </Button>
                </div>

                {/* Smart Search Toggle */}
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleSmartSearch}
                        disabled={isLoading}
                        className={cn(
                            "gap-2 h-12 px-6 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:border-primary/50",
                            searchMode === "smart" && hasSearched ? "bg-primary/10 text-primary border-primary/50 shadow-inner" : "text-muted-foreground bg-background/50"
                        )}
                    >
                        <Sparkles className={cn("w-4 h-4", isLoading && searchMode === "smart" ? "animate-spin" : "")} />
                        {isLoading && searchMode === "smart" ? "Analyse du profil..." : "Recherche Intelligente (IA)"}
                    </Button>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : hasSearched && !isLoading ? (
                        <div className="text-center py-16 bg-card rounded-lg border border-border border-dashed">
                            <p className="text-muted-foreground">No opportunities found. Try adjusting your search.</p>
                        </div>
                    ) : !hasSearched && !isLoading ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground text-sm">
                                Enter a keyword or use Smart Search to find jobs tailored to your resume.
                            </p>
                        </div>
                    ) : (
                        // Loading State Skeletons
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-card rounded-lg border border-border animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

