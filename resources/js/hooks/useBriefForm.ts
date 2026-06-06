import type { BriefFormData } from '@/types/brief';
import { validateBriefForm } from '@/utils/briefCreationValidation';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef } from 'react';
import { useAutosave } from './useAutosave';
import { useBlurValidation } from './useBlurValidation';
import { useI18n } from './useI18n';
import { useUnsavedChanges } from './useUnsavedChanges';

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
    initial?: Partial<BriefFormData>;
    autosaveKey?: string;
    onSubmit: (data: BriefFormData & { status: 'active' | 'draft' }) => void;
    onSaveDraft: (data: BriefFormData & { status: 'active' | 'draft' }) => void;
}

export function useBriefForm({ initial = {}, autosaveKey = 'new', onSubmit, onSaveDraft }: UseBriefFormOptions) {
    const { t } = useI18n();

    const initialValues: BriefFormData = {
        ...EMPTY_FORM,
        ...initial,
        scoring_weights: initial.scoring_weights ?? DEFAULT_WEIGHTS,
    };

    const statusRef = useRef<'active' | 'draft'>('active');

    const { data, setData, transform, processing, errors: serverErrors, setError, clearErrors, reset } = useForm<BriefFormData>(initialValues);

    useEffect(() => {
        transform((d) => ({ ...d, status: statusRef.current }));
    }, [transform]);

    const isDirty = useMemo(
        () => JSON.stringify(data) !== JSON.stringify(initialValues),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data],
    );

    const { confirmLeave } = useUnsavedChanges(isDirty);

    const { blurErrors, onBlur, touchAll, resetTouched } = useBlurValidation(data);

    const errors = { ...blurErrors, ...serverErrors };

    const { hasRestorableData, restore, dismissRestore, clearSaved, lastSavedAt } = useAutosave({
        key: autosaveKey,
        data,
        isDirty,
        onRestore: (saved) => {
            // Restore each field individually so Inertia tracks the change.
            (Object.keys(saved) as (keyof BriefFormData)[]).forEach((field) => {
                setData(field, saved[field] as BriefFormData[typeof field]);
            });
        },
    });

    function validate(): boolean {
        clearErrors();
        touchAll();
        const errs = validateBriefForm(data, t);
        if (Object.keys(errs).length === 0) return true;
        Object.entries(errs).forEach(([field, message]) => setError(field as keyof BriefFormData, message as string));
        return false;
    }

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
        confirmLeave();
        clearSaved();
        resetTouched();
        onSubmit({ ...data, status: 'active' });
    }

    function handleSaveDraft() {
        if (!validateDraft()) return;
        statusRef.current = 'draft';
        confirmLeave();
        clearSaved();
        resetTouched();
        onSaveDraft({ ...data, status: 'draft' });
    }

    return {
        data,
        setData,
        processing,
        errors,
        isDirty,
        onBlur,
        hasRestorableData,
        restore,
        dismissRestore,
        lastSavedAt,
        handleSubmit,
        handleSaveDraft,
        reset,
    };
}
