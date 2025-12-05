import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MapPin, Building2, Briefcase, ExternalLink, Sparkles, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { jobsService, type JobOffer } from "~/services/jobs";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

function useTypewriter(phrases: string[], typingSpeed = 50, deletingSpeed = 30, pauseDuration = 2000) {
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeedState, setTypingSpeedState] = useState(typingSpeed);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeedState(isDeleting ? deletingSpeed : typingSpeed);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), pauseDuration);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeedState);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, phrases, typingSpeed, deletingSpeed, pauseDuration, typingSpeedState]);

    return text;
}

function formatSalary(salary: string): string {
    // Example: "Annuel de 35000.0 Euros à 39000.0 Euros sur 12.0 mois"
    // Example: "Mensuel de 32000.0 Euros à 35000.0 Euros sur 12.0 mois"
    try {
        // Extract numbers (handle 35000.0, 35000, 35 000)
        const matches = salary.replace(/\s/g, '').match(/(\d+(?:[\.,]\d+)?)/g);

        if (matches && matches.length >= 1) {
            // Parse numbers (replace comma with dot if needed)
            const nums = matches.map(m => parseFloat(m.replace(',', '.')));
            const min = nums[0];
            const max = nums.length > 1 ? nums[1] : min;

            const formatNum = (n: number) => {
                if (n >= 1000) return `${Math.round(n / 1000)}k€`;
                return `${n}€`;
            };

            const lowerSalary = salary.toLowerCase();
            let period = "";

            if (lowerSalary.includes("annuel") || lowerSalary.includes("an")) period = "/ an";
            else if (lowerSalary.includes("mensuel") || lowerSalary.includes("mois")) period = "/ mois";
            else if (lowerSalary.includes("horaire") || lowerSalary.includes("heure")) period = "/ h";

            if (min === max) {
                return `${formatNum(min)} ${period}`;
            }
            return `${formatNum(min)} - ${formatNum(max)} ${period}`;
        }
        return salary;
    } catch (e) {
        return salary;
    }
}

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
            onClick={() => {
                const selection = window.getSelection();
                if (!selection || selection.toString().length === 0) {
                    setIsOpen(!isOpen);
                }
            }}
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
                                {formatSalary(job.salaire.libelle)}
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
                                Recommandé pour vous
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
    const [nlQuery, setNlQuery] = useState("");
    const [jobs, setJobs] = useState<JobOffer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const typewriterText = useTypewriter([
        "Trouve-moi un poste React en remote > 80k€...",
        "Montre-moi des jobs de PM Senior dans la Climate Tech...",
        "Designer Junior avec sponsor visa..."
    ]);

    const handleSmartSearch = async () => {
        // Allow empty query (uses profile)
        // if (!nlQuery.trim()) return;

        setIsLoading(true);
        setJobs([]); // Clear previous results
        try {
            const results = await jobsService.smartSearch(undefined, nlQuery);
            setJobs(results);
        } catch (error) {
            console.error("Smart search failed:", error);
        } finally {
            setIsLoading(false);
            setHasSearched(true);
        }
    };

    const quickChips = [
        "100% Télétravail",
        "Salaire > 60k",
        "Startups",
        "Python"
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            {/* Main Column */}
            <div className="w-full max-w-[800px] space-y-8">

                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                    <h1 className="text-5xl font-serif font-medium text-foreground tracking-tight">
                        Opportunités
                    </h1>
                    <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                        Décrivez votre job idéal, ou laissez vide pour une recherche basée sur votre profil.
                    </p>
                </div>

                {/* Search Interface (Command Bar) */}
                <div className="relative w-full max-w-2xl mx-auto group z-20">

                    <div className="relative flex items-center w-full bg-white rounded-2xl shadow-[0px_12px_24px_-8px_rgba(0,0,0,0.08)] h-16 px-4 border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">

                        {/* Left Icon */}
                        <Sparkles className="w-6 h-6 text-gray-400 mr-4 shrink-0" />

                        {/* Input */}
                        <input
                            className="w-full h-full bg-transparent border-0 focus:ring-0 text-lg text-gray-800 placeholder:text-gray-400 outline-none"
                            placeholder="Décrivez votre job idéal ou laissez vide pour utiliser votre profil..."
                            value={nlQuery}
                            onChange={(e) => setNlQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSmartSearch()}
                        />

                        {/* Right Action (Black Pearl) */}
                        <div className="flex items-center ml-4 shrink-0">
                            <button
                                onClick={handleSmartSearch}
                                disabled={isLoading}
                                className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Chips */}
                    <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
                        {quickChips.map((chip) => (
                            <button
                                key={chip}
                                onClick={() => setNlQuery(chip)}
                                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 transition-colors border border-gray-200"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : hasSearched && !isLoading ? (
                        <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
                            <p className="text-muted-foreground">Aucune opportunité trouvée. Essayez de reformuler votre recherche.</p>
                        </div>
                    ) : !hasSearched && !isLoading ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground text-sm">
                                Utilisez la recherche intelligente pour trouver des offres sur mesure.
                            </p>
                        </div>
                    ) : (
                        // Loading State Skeletons
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 bg-card rounded-xl border border-border animate-pulse" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

