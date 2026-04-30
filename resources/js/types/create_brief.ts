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
