export interface WorkExperience {
    id?: number;
    company: string;
    role: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

export interface Education {
    id?: number;
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    is_current_study?: boolean;
}

export interface Project {
    id?: number;
    name: string;
    role?: string;
    tech_stack?: string;
    details?: string;
    url?: string;
}

export interface Skill {
    id?: number;
    name: string;
    category?: string;
    level?: string;
}

export interface Language {
    id?: number;
    name: string;
    proficiency?: string;
}

export interface ResumeData {
    website?: string;
    linkedin?: string;
    summary?: string;
    work_experiences: WorkExperience[];
    educations: Education[];
    projects: Project[];
    skills: Skill[];
    languages: Language[];
}
