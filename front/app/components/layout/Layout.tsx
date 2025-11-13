import { Navbar } from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="bg-gradient-to-br from-primary-50/30 via-white to-accent/5">
        {children}
      </main>
      <footer className="border-t bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Propulsé par</span>
              <span className="font-semibold text-secondary">Groq Whisper</span>
              <span>•</span>
              <span className="font-semibold text-secondary">Google Gemini</span>
              <span>•</span>
              <span className="font-semibold text-secondary">Edge TTS</span>
            </div>
            <div className="text-sm text-gray-600">
              © 2024 Entervio. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}