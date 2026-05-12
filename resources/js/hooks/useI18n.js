import { usePage } from '@inertiajs/react';

export function useI18n() {
    const { translations } = usePage().props;

    const t = (path, options = {}) => {
        const { fallback, ...replacements } = options;

        const value = path.split('.').reduce((acc, key) => acc?.[key], translations);

        if (typeof value !== 'string') {
            return fallback ?? path;
        }

        return Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
    };

    return { t };
}
