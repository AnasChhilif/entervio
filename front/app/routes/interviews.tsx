// app/routes/interviews.tsx
import type { Route } from "./+types/interviews";
import { Layout } from "~/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mes entretiens - Entervio" },
    { name: "description", content: "Historique de vos entretiens" },
  ];
}

export default function Interviews() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
            Mes entretiens
          </h1>
          <p className="text-xl text-muted-foreground">
            Consultez l'historique de vos sessions
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardContent className="py-20 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-3">
              Fonctionnalité à venir
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Vous pourrez bientôt consulter tous vos entretiens passés, revoir vos
              performances et suivre votre progression
            </p>
            <Button asChild size="lg">
              <Link to="/setup">Démarrer un nouvel entretien</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}