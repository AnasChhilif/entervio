import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface JobSearchHeaderProps {
  isLoading: boolean;
  onSearch: (query: string) => void;
}

export function JobSearchHeader({ isLoading, onSearch }: JobSearchHeaderProps) {
  const [nlQuery, setNlQuery] = useState("");

  const handleSearch = () => {
    onSearch(nlQuery);
  };

  const quickChips = [
    "CDI Temps Plein",
    "Junior",
    "Tech & IT",
    "Commercial",
    "Nouveaux Jobs",
  ];

  return (
    <div className="bg-white border-b border-gray-200 shrink-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
              Opportunités
            </h1>
            <p className="text-sm text-gray-500 hidden md:block">
              Trouvez votre prochain défi.
            </p>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Sparkles className="h-5 w-5 text-indigo-500 group-focus-within:text-indigo-600 transition-colors animate-pulse" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white transition-all shadow-sm"
                placeholder="Décrivez votre job idéal avec vos propres mots..."
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setNlQuery(chip)}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-xs font-medium text-gray-600 transition-all whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}