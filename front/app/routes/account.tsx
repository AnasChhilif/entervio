import { useState, useEffect } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, FileText, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

import type { UserDetailed } from "~/types/user";

import { useAuth } from "~/context/AuthContext";
import { useNavigate } from "react-router";

export default function Account() {
  const { token, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "" });

  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/login");
      return;
    }

    if (token) {
      fetchUser();
    }
  }, [token, authLoading, navigate]);

  const fetchUser = async () => {
    if (!token) return;

    try {
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);

      const res = await fetch("http://localhost:8000/api/v1/auth/me", { headers });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({ first_name: data.first_name, last_name: data.last_name, phone: data.phone || "" });
      } else {
        // Handle token expiry or invalid token
        if (res.status === 401) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const headers = new Headers({
        "Content-Type": "application/json",
      });
      headers.append("Authorization", `Bearer ${token}`);

      const res = await fetch("http://localhost:8000/api/v1/auth/me", {
        method: "PUT",
        headers,
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-2">
          Mon Compte
        </h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="pt-6 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{user?.first_name} {user?.last_name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
            {user?.has_resume && (
              <Badge variant="secondary" className="mb-4">
                CV Importé
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Details & Edit */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Informations Personnelles</CardTitle>
                  <CardDescription>Vos coordonnées de contact</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                  {editing ? "Annuler" : "Modifier"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Nom</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Enregistrer</Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center p-3 border rounded-lg">
                    <Mail className="w-5 h-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 border rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground mr-3" />
                    <div>
                      <p className="text-sm font-medium">Téléphone</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.phone || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Link to="/account/resume" className="block">
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Gérer mon CV</h3>
                  <p className="text-muted-foreground">Modifier mes expériences, formations et compétences</p>
                </div>
                <Button variant="ghost" size="icon">
                  →
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}