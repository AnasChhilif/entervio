import type { Route } from "./+types/interviews";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { FileText, ArrowRight } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Mes entretiens - Entervio" },
    { name: "description", content: "Historique de vos entretiens" },
  ];
}

export default function Interviews() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Mes entretiens
        </h1>
        <p className="text-xl text-muted-foreground">
          Consultez l'historique de vos sessions
        </p>
      </div>

      <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-xl shadow-black/5 overflow-hidden">
        <CardContent className="py-24 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-inner shadow-primary/5">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Historique bientôt disponible
            </h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed text-lg">
              Vous pourrez bientôt consulter tous vos entretiens passés, revoir vos
              performances et suivre votre progression détaillée.
            </p>
            <Button asChild size="lg" className="h-12 px-8 shadow-lg shadow-primary/20">
              <Link to="/setup">
                Démarrer un nouvel entretien
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}