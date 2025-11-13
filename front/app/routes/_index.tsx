import { Link } from "react-router";
import type { Route } from "./+types/_index";
import { Layout } from "~/components/layout/Layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Entervio - Entraînez-vous aux entretiens d'embauche" },
    {
      name: "description",
      content: "Pratiquez vos entretiens d'embauche avec un recruteur IA",
    },
  ];
}

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-20 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold tracking-wide">
              Formation professionnelle
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Maîtrisez vos entretiens
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              avec l'IA
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Entraînez-vous avec un recruteur virtuel intelligent. Recevez des
            feedbacks personnalisés et améliorez vos compétences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg h-14 px-8 shadow-lg bg-primary hover:bg-primary-600">
              <Link to="/setup">
                Démarrer un entretien
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link to="/interviews">Voir mes entretiens</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <Card className="text-center border-2 border-gray-200 hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">
                100%
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Simulation réaliste
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center border-2 border-gray-200 hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">
                3
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Styles de recruteur
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="text-center border-2 border-gray-200 hover:shadow-lg transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">
                15min
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Durée moyenne
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Pourquoi choisir Entervio ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Simulation authentique",
                desc: "Vivez une expérience d'entretien réaliste avec des questions pertinentes et contextuelles",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                title: "Interaction vocale",
                desc: "Répondez naturellement à voix haute comme dans un véritable entretien professionnel",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Profils variés",
                desc: "Trois styles de recruteur pour vous préparer à toutes les situations",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                ),
                title: "Historique complet",
                desc: "Accédez à tous vos entretiens passés et suivez votre progression",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Feedback détaillé",
                desc: "Recevez des analyses approfondies de vos performances après chaque session",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: "Confidentialité",
                desc: "Vos données sont sécurisées et vos sessions restent privées",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-2 border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* How it works */}
        <Card className="mb-24 border-2 border-gray-200 overflow-hidden bg-white shadow-xl">
          <div className="bg-gradient-to-r from-primary to-accent p-8 text-white">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Comment ça fonctionne ?
            </h2>
          </div>
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  num: "1",
                  title: "Configuration",
                  desc: "Renseignez votre nom et sélectionnez le profil de recruteur qui correspond à vos besoins de préparation",
                },
                {
                  num: "2",
                  title: "Entretien",
                  desc: "Participez à une session interactive de 10-15 minutes avec des questions personnalisées et répondez vocalement",
                },
                {
                  num: "3",
                  title: "Analyse",
                  desc: "Consultez votre évaluation détaillée avec des recommandations pour améliorer vos performances futures",
                },
              ].map((step) => (
                <div key={step.num} className="relative">
                  <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-2 border-gray-200 overflow-hidden shadow-xl bg-white">
          <div className="bg-gradient-to-r from-secondary via-primary to-accent p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à exceller dans vos entretiens ?
            </h2>
            <p className="text-xl mb-8 text-white/95 max-w-2xl mx-auto">
              Rejoignez des centaines de candidats qui améliorent leurs compétences
              avec Entervio
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg h-14 px-10 shadow-lg hover:shadow-xl bg-white text-primary hover:bg-gray-100"
            >
              <Link to="/setup">Commencer maintenant</Link>
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}