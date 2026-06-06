import type { BriefFormData } from '@/types/brief';
import { validateBriefForm } from '@/utils/briefCreationValidation';
import { useCallback, useRef, useState } from 'react';
import { useI18n } from './useI18n';

type FieldErrors = Partial<Record<keyof BriefFormData, string>>;

/**
 * Per-field blur validation for BriefForm.
 */
export function useBlurValidation(data: BriefFormData) {
    const { t } = useI18n();

    const [touched, setTouched] = useState<Set<keyof BriefFormData>>(new Set());

    const dataRef = useRef(data);
    dataRef.current = data;

    /**
     * Run full validation against current data and return only errors for
     * fields that have been touched.
     */
    const blurErrors: FieldErrors = (() => {
        if (touched.size === 0) return {};
        const allErrors = validateBriefForm(dataRef.current, t);
        const filtered: FieldErrors = {};
        touched.forEach((field) => {
            if (allErrors[field]) filtered[field] = allErrors[field];
        });
        return filtered;
    })();

    /**
     * Mark a field as touched and trigger validation for it.
     * Pass this as the onBlur handler for each field.
     */
    const onBlur = useCallback((field: keyof BriefFormData) => {
        setTouched((prev) => {
            if (prev.has(field)) return prev; // already touched — no re-render
            const next = new Set(prev);
            next.add(field);
            return next;
        });
    }, []);

    /**
     * Touch every field at once — call this just before the submit handler
     * runs client-side validation so all errors surface simultaneously.
     */
    const touchAll = useCallback(() => {
        const allFields = Object.keys(dataRef.current) as (keyof BriefFormData)[];
        setTouched(new Set(allFields));
    }, []);

    /**
     * Reset touched state — call after a successful save/submit.
     */
    const resetTouched = useCallback(() => {
        setTouched(new Set());
    }, []);

    return { blurErrors, onBlur, touchAll, resetTouched };
}
