export type ScoringWeights = {
    experience: number;
    education: number;
    location: number;
};

export type BriefFormData = {
    product_reference: string;
    mission_code: string;
    title: string;
    sector: string;
    contract_type: string;
    location: string;
    salary_range: string;
    min_experience_years: string;
    education_level: string;
    languages: string;
    seniority_level: string;
    target_companies: string;
    gender_pref: string;
    age_range: string;
    mission_description: string;
    required_skills: string;
    soft_skills: string;
    search_prompt: string;
    scoring_weights: ScoringWeights;
};

export type SelectOption = {
    value: string;
    label: string;
};

export interface CreateBriefProps {
    params: {
        sectors: SelectOption[];
        education_levels: SelectOption[];
        experience_options: SelectOption[];
        age_ranges: SelectOption[];
        languages: SelectOption[];
        seniority_levels: SelectOption[];
        contract_types: SelectOption[];
        gender_prefs: SelectOption[];
    };
}

export type EditBriefProps = {
    brief: Brief;
    params: {
        sectors: SelectOption[];
        education_levels: SelectOption[];
        experience_options: SelectOption[];
        age_ranges: SelectOption[];
        languages: SelectOption[];
        seniority_levels: SelectOption[];
        contract_types: SelectOption[];
        gender_prefs: SelectOption[];
    };
};

export type Brief = {
    id: number;
    product_reference: string;
    mission_code: string;
    title: string;
    sector: string;
    contract_type: string;
    location: string;
    salary_range: string;
    min_experience_years: string;
    education_level: string;
    languages: string;
    seniority_level: string;
    target_companies: string;
    gender_pref: string;
    age_range: string;
    mission_description: string;
    required_skills: string;
    soft_skills: string;
    search_prompt: string | null;
    scoring_weights: ScoringWeights;
    status: string;
    created_at: string;
    created_by: string | null;
};

type Filters = {
    search?: string;
};

export type IndexBriefProps = {
    briefs: {
        data: Brief[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Filters;
    brief_statuses: SelectOption[];
    params: {
        sectors: SelectOption[];
        education_levels: SelectOption[];
        experience_options: SelectOption[];
        age_ranges: SelectOption[];
        languages: SelectOption[];
        seniority_levels: SelectOption[];
        contract_types: SelectOption[];
        gender_prefs: SelectOption[];
    };
};

export type DeleteBriefModalProps = {
    brief: Brief;
    onConfirm: () => void;
    onCancel: () => void;
};
export type ShowBriefProps = {
    brief: Brief;
    params: {
        sectors: SelectOption[];
        education_levels: SelectOption[];
        experience_options: SelectOption[];
        age_ranges: SelectOption[];
        languages: SelectOption[];
        seniority_levels: SelectOption[];
        contract_types: SelectOption[];
        gender_prefs: SelectOption[];
    };
};
