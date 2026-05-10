export type ScoringWeights = {
    experience: number;
    education: number;
    sector: number;
    soft_skills: number;
    location: number;
};

export type BriefFormData = {
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
    scoring_weights: ScoringWeights;
};

export type SelectOption = {
    value: string;
    label: string;
};

export type CreateBriefProps = {
    contractTypes: SelectOption[];
    genderPrefs: SelectOption[];
};

export type Brief = {
    id: number;
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
    scoring_weights: ScoringWeights;
    status: string;
    created_at: string;
    created_by: string | null;
};
export type EditBriefProps = {
    brief: Brief;
    contractTypes: SelectOption[];
    genderPrefs: SelectOption[];
};

type Filters = {
    search?: string;
};

export type IndexBriefProps = {
    briefs: {
        data: Brief[];
    };
    filters: Filters;
};

export type DeleteBriefModalProps = {
    brief: Brief;
    onConfirm: () => void;
    onCancel: () => void;
};
export type ShowBriefProps = {
    brief: Brief;
};
