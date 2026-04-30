import type { BriefFormData } from '@/types/create_brief';

type Translator = (path: string) => string;

export function validateBriefForm(data: BriefFormData, t: Translator): Partial<Record<string, string>> {
    const errs: Partial<Record<string, string>> = {};

    if (!data.title.trim()) {
        errs.title = t('briefs.validation.required');
    } else if (data.title.length < 3) {
        errs.title = t('briefs.validation.min_length').replace(':min', '3');
    } else if (data.title.length > 100) {
        errs.title = t('briefs.validation.max_length').replace(':max', '100');
    }

    if (!data.sector.trim()) {
        errs.sector = t('briefs.validation.required');
    }

    if (!data.contract_type) {
        errs.contract_type = t('briefs.validation.required');
    }

    if (!data.location.trim()) {
        errs.location = t('briefs.validation.required');
    }

    if (data.salary_range && !/^\d+(\s*[-–]\s*\d+)?(\s*(€|EUR|MAD|TND|DZD|FCFA|USD))?$/.test(data.salary_range.trim())) {
        errs.salary_range = t('briefs.validation.salary_format');
    }

    if (!data.min_experience_years.trim()) {
        errs.min_experience_years = t('briefs.validation.required');
    } else if (isNaN(Number(data.min_experience_years)) || Number(data.min_experience_years) < 0) {
        errs.min_experience_years = t('briefs.validation.positive_number');
    } else if (Number(data.min_experience_years) > 50) {
        errs.min_experience_years = t('briefs.validation.max_value').replace(':max', '50');
    }

    if (!data.education_level.trim()) {
        errs.education_level = t('briefs.validation.required');
    }

    if (!data.mission_description.trim()) {
        errs.mission_description = t('briefs.validation.required');
    } else if (data.mission_description.length < 20) {
        errs.mission_description = t('briefs.validation.min_length').replace(':min', '20');
    } else if (data.mission_description.length > 2000) {
        errs.mission_description = t('briefs.validation.max_length').replace(':max', '2000');
    }

    if (data.age_range && !/^\d+(\s*[-–]\s*\d+)?$/.test(data.age_range.trim())) {
        errs.age_range = t('briefs.validation.age_format');
    }

    const weights = Object.values(data.scoring_weights);
    const total = weights.reduce((a, b) => a + b, 0);
    const valid = weights.every((w) => w >= 0 && w <= 100);

    if (!valid) {
        errs.scoring_weights = t('briefs.validation.weight_range');
    } else if (total !== 100) {
        errs.scoring_weights = t('briefs.validation.weight_total').replace(':total', String(total));
    }

    if (!data.required_skills.trim()) {
        errs.required_skills = t('briefs.validation.required');
    }

    return errs;
}
