import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Briefcase, GraduationCap, Code, Languages, Lightbulb } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
// import { Separator } from "~/components/ui/separator"; // Not available

import type { ResumeData, WorkExperience, Education, Project, Skill, Language } from "~/types/resume";
import { useAuth } from "~/context/AuthContext";
import { useNavigate } from "react-router";

const EMPTY_RESUME: ResumeData = {
    work_experiences: [],
    educations: [],
    projects: [],
    skills: [],
    languages: [],
};

export default function ResumePage() {
    const { token, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [resume, setResume] = useState<ResumeData>(EMPTY_RESUME);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !token) {
            navigate("/login");
            return;
        }

        if (token) {
            fetchResume();
        }
    }, [token, authLoading, navigate]);

    const fetchResume = async () => {
        if (!token) return;

        try {
            const headers = new Headers();
            headers.append("Authorization", `Bearer ${token}`);
            const res = await fetch("http://localhost:8000/api/v1/resume/full", { headers });
            if (res.ok) {
                const data = await res.json();
                setResume(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", `Bearer ${token}`);

            const res = await fetch("http://localhost:8000/api/v1/resume/full", {
                method: "PUT",
                headers,
                body: JSON.stringify(resume),
            });
            if (res.ok) {
                // success toast or similar
                const data = await res.json();
                setResume(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // --- Generic Handlers ---
    const updateItem = <T,>(listKey: keyof ResumeData, index: number, field: keyof T, value: any) => {
        setResume(prev => {
            const list = [...prev[listKey]] as any[];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listKey]: list };
        });
    };

    const addItem = (listKey: keyof ResumeData, emptyItem: any) => {
        setResume(prev => ({
            ...prev,
            [listKey]: [...prev[listKey], emptyItem]
        }));
    };

    const removeItem = (listKey: keyof ResumeData, index: number) => {
        setResume(prev => ({
            ...prev,
            [listKey]: (prev[listKey] as any[]).filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center mb-8 gap-4">
                <Button variant="ghost" asChild>
                    <Link to="/account"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">Mon CV</h1>
                    <p className="text-muted-foreground">Mettez à jour vos expériences et compétences</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Enregistrer
                </Button>
            </div>

            <div className="space-y-10">
                {/* Work Experience */}
                <Section title="Expériences Professionnelles" icon={<Briefcase />}
                    onAdd={() => addItem('work_experiences', { company: '', role: '' })}>
                    {resume.work_experiences.map((item, idx) => (
                        <Card key={idx} className="relative group">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={() => removeItem('work_experiences', idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Entreprise</Label>
                                    <Input value={item.company} onChange={(e) => updateItem('work_experiences', idx, 'company', e.target.value)} placeholder="Ex: Google" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rôle</Label>
                                    <Input value={item.role} onChange={(e) => updateItem('work_experiences', idx, 'role', e.target.value)} placeholder="Ex: Senior Developer" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date début</Label>
                                    <Input value={item.start_date || ''} onChange={(e) => updateItem('work_experiences', idx, 'start_date', e.target.value)} placeholder="YYYY-MM" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date fin</Label>
                                    <Input value={item.end_date || ''} onChange={(e) => updateItem('work_experiences', idx, 'end_date', e.target.value)} placeholder="YYYY-MM or Present" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Description</Label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={item.description || ''}
                                        onChange={(e) => updateItem('work_experiences', idx, 'description', e.target.value)}
                                        placeholder="Décrivez vos accomplissements..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </Section>

                {/* Education */}
                <Section title="Formation" icon={<GraduationCap />}
                    onAdd={() => addItem('educations', { institution: '', degree: '' })}>
                    {resume.educations.map((item, idx) => (
                        <Card key={idx} className="relative group">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={() => removeItem('educations', idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Institution</Label>
                                    <Input value={item.institution} onChange={(e) => updateItem('educations', idx, 'institution', e.target.value)} placeholder="Ex: University of Paris" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Diplôme</Label>
                                    <Input value={item.degree} onChange={(e) => updateItem('educations', idx, 'degree', e.target.value)} placeholder="Ex: Master in CS" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de fin</Label>
                                    <Input value={item.end_date || ''} onChange={(e) => updateItem('educations', idx, 'end_date', e.target.value)} placeholder="YYYY" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </Section>

                {/* Projects */}
                <Section title="Projets" icon={<Code />}
                    onAdd={() => addItem('projects', { name: '', tech_stack: '' })}>
                    {resume.projects.map((item, idx) => (
                        <Card key={idx} className="relative group">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                onClick={() => removeItem('projects', idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nom</Label>
                                    <Input value={item.name} onChange={(e) => updateItem('projects', idx, 'name', e.target.value)} placeholder="Ex: Entervio" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stack Technique</Label>
                                    <Input value={item.tech_stack || ''} onChange={(e) => updateItem('projects', idx, 'tech_stack', e.target.value)} placeholder="Ex: React, Python, Postgres" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Détails</Label>
                                    <textarea
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={item.details || ''}
                                        onChange={(e) => updateItem('projects', idx, 'details', e.target.value)}
                                        placeholder="Description du projet..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </Section>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Skills */}
                    <Section title="Compétences" icon={<Lightbulb />}
                        onAdd={() => addItem('skills', { name: '' })}>
                        <div className="grid gap-4">
                            {resume.skills.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input value={item.name} onChange={(e) => updateItem('skills', idx, 'name', e.target.value)} placeholder="Ex: Python" />
                                    <Input className="w-1/3" value={item.category || ''} onChange={(e) => updateItem('skills', idx, 'category', e.target.value)} placeholder="Category" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem('skills', idx)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Languages */}
                    <Section title="Langues" icon={<Languages />}
                        onAdd={() => addItem('languages', { name: '' })}>
                        <div className="grid gap-4">
                            {resume.languages.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input value={item.name} onChange={(e) => updateItem('languages', idx, 'name', e.target.value)} placeholder="Ex: Anglais" />
                                    <Input className="w-1/3" value={item.proficiency || ''} onChange={(e) => updateItem('languages', idx, 'proficiency', e.target.value)} placeholder="Niveau" />
                                    <Button variant="ghost" size="icon" onClick={() => removeItem('languages', idx)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

            </div>
        </div>
    );
}

function Section({ title, icon, children, onAdd }: { title: string, icon: React.ReactNode, children: React.ReactNode, onAdd: () => void }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                    {icon} {title}
                </div>
                <Button variant="outline" size="sm" onClick={onAdd} className="gap-2">
                    <Plus className="h-4 w-4" /> Ajouter
                </Button>
            </div>
            <hr className="border-t border-border" />
            {children}
        </div>
    );
}
