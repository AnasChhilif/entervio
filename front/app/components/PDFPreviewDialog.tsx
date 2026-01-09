import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Download, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

interface PDFPreviewDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  idleTitle: string;
  idleDescription: string;
  idleIcon: React.ReactNode;
  loadingMessages: string[];
  onGenerate: () => Promise<Blob>;
  downloadFilename: string;
  accentColor?: "emerald" | "blue";
}

export function PDFPreviewDialog({
  trigger,
  title,
  description,
  idleTitle,
  idleDescription,
  idleIcon,
  loadingMessages,
  onGenerate,
  downloadFilename,
  accentColor = "emerald",
}: PDFPreviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"idle" | "generating" | "preview">("idle");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const colors = {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-500",
      spinner: "border-t-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700",
      shadow: "shadow-emerald-200/50",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      spinner: "border-t-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
      shadow: "shadow-blue-200/50",
    },
  };

  const color = colors[accentColor];

  useEffect(() => {
    if (!isOpen && pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setStep("idle");
    }
  }, [isOpen, pdfUrl]);

  const handleGenerate = async () => {
    setStep("generating");
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);

    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 1500);

    try {
      const blob = await onGenerate();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setStep("preview");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Erreur lors de la génération du PDF. Veuillez réessayer.");
      setStep("idle");
    } finally {
      clearInterval(interval);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white z-10">
          <DialogTitle className="flex items-center gap-2 text-xl font-serif">
            <Sparkles className={`w-5 h-5 ${color.text}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-gray-50/50 relative overflow-hidden flex flex-col">
          {step === "idle" && (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-500 space-y-6">
              <div className={`w-20 h-20 ${color.bg} rounded-full flex items-center justify-center mb-2`}>
                {idleIcon}
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-serif text-gray-900">
                  {idleTitle}
                </h3>
                <p>{idleDescription}</p>
              </div>
              <Button
                onClick={handleGenerate}
                size="lg"
                className={`rounded-full px-8 ${color.button} text-white shadow-lg ${color.shadow}`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Générer
              </Button>
            </div>
          )}

          {step === "generating" && (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className={`w-24 h-24 border-4 border-gray-100 ${color.spinner} rounded-full animate-spin`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className={`w-8 h-8 ${color.text} animate-pulse`} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  {loadingMessage}
                </h3>
                <p className="text-sm text-gray-500">
                  Cela peut prendre quelques secondes...
                </p>
              </div>
            </div>
          )}

          {step === "preview" && pdfUrl && (
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <iframe
                src={pdfUrl}
                className="w-full flex-1 border-0 bg-gray-100"
                title="PDF Preview"
              />
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-white">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          {step === "preview" && (
            <Button
              onClick={handleDownload}
              className={color.button + " text-white"}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}