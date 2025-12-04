import { Link } from "react-router";
import { User, Briefcase, Mic, LogOut } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/context/AuthContext";

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            E
                        </div>
                        Entervio
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/setup" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                            <Mic className="w-4 h-4" />
                            S'entraîner
                        </Link>
                        <Link to="/interviews" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Mes entretiens
                        </Link>
                        <Link to="/jobs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Offres
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button asChild variant="ghost" size="icon" className="rounded-full">
                                <Link to="/account">
                                    <User className="w-5 h-5" />
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={() => logout()}>
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="sm">
                                <Link to="/login">Connexion</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link to="/signup">Inscription</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
