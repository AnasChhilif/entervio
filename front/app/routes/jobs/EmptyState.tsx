import { Search, Sparkles } from "lucide-react";

type EmptyStateType = "no-search" | "no-results" | "loading";

interface EmptyStateProps {
  type: EmptyStateType;
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "loading") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-pulse">
        <div className="lg:col-span-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="hidden lg:block lg:col-span-8">
          <div className="h-full bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          Aucune opportunité trouvée
        </h3>
        <p className="text-gray-500">
          Essayez de reformuler votre recherche ou d'élargir vos critères.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-50">
      <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-400 font-medium">
        Lancez une recherche pour voir les résultats
      </p>
    </div>
  );
}