export type CandidatStatus = 'sourced' | 'contacted' | 'interview' | 'recommended' | 'offer' | 'rejected';

export interface Candidat {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    current_title: string | null;
    current_company: string | null;
    location: string | null;
    experience_years: number | null;
    education_level: string | null;
    source: string | null;
    source_url: string | null;
    status: CandidatStatus;
    linkedin_url: string | null;
    headline: string | null;
    summary: string | null;
    skills: string[] | null;
    open_to_work: boolean;
    raw_data: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedCandidats {
    data: Candidat[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface IndexCandidatFilters {
    search?: string;
    status?: CandidatStatus;
}

export interface IndexCandidatProps {
    candidats: PaginatedCandidats;
    filters: IndexCandidatFilters;
}
