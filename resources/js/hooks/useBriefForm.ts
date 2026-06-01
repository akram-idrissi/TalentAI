import type { BriefFormData } from '@/types/brief';
import { validateBriefForm } from '@/utils/briefCreationValidation';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useI18n } from './useI18n';

const DEFAULT_WEIGHTS = {
    experience: 30,
    education: 20,
    sector: 20,
    soft_skills: 20,
    location: 10,
};

const EMPTY_FORM: BriefFormData = {
    title: '',
    sector: '',
    contract_type: '',
    location: '',
    salary_range: '',
    min_experience_years: '',
    education_level: '',
    languages: '',
    seniority_level: '',
    target_companies: '',
    gender_pref: '',
    age_range: '',
    mission_description: '',
    required_skills: '',
    soft_skills: '',
    scoring_weights: DEFAULT_WEIGHTS,
};

interface UseBriefFormOptions {
    /**
     * Initial values — pass `brief` when editing, omit when creating.
     */
    initial?: Partial<BriefFormData>;
    /**
     * Called with the fully-built form data when submitting as active.
     */
    onSubmit: (data: BriefFormData & { status: 'active' | 'draft' }) => void;
    /**
     * Called with the fully-built form data when saving as draft.
     */
    onSaveDraft: (data: BriefFormData & { status: 'active' | 'draft' }) => void;
}

export function useBriefForm({ initial = {}, onSubmit, onSaveDraft }: UseBriefFormOptions) {
    const { t } = useI18n();

    // statusRef lets us set the status immediately before the Inertia submit
    // without triggering a re-render or racing against transform().
    const statusRef = useRef<'active' | 'draft'>('active');

    const { data, setData, transform, processing, errors, setError, clearErrors, reset } = useForm<BriefFormData>({
        ...EMPTY_FORM,
        ...initial,
        scoring_weights: initial.scoring_weights ?? DEFAULT_WEIGHTS,
    });

    // Inject the status into the payload on every submit.
    // This runs once — statusRef mutation before post()/put() is what controls the value.
    useEffect(() => {
        transform((d) => ({ ...d, status: statusRef.current }));
    }, [transform]);

    /**
     * Run full validation. Returns true when the form is clean.
     */
    function validate(): boolean {
        clearErrors();
        const errs = validateBriefForm(data, t);
        if (Object.keys(errs).length === 0) return true;
        Object.entries(errs).forEach(([field, message]) => setError(field as keyof BriefFormData, message as string));
        return false;
    }

    /**
     * Validate only the minimum required for a draft (title only).
     */
    function validateDraft(): boolean {
        clearErrors();
        if (data.title.trim()) return true;
        setError('title', t('briefs.validation.required'));
        return false;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        statusRef.current = 'active';
        onSubmit({ ...data, status: 'active' });
    }

    function handleSaveDraft() {
        if (!validateDraft()) return;
        statusRef.current = 'draft';
        onSaveDraft({ ...data, status: 'draft' });
    }

    return {
        data,
        setData,
        processing,
        errors,
        handleSubmit,
        handleSaveDraft,
        reset,
    };
}
