import { usePage } from '@inertiajs/react';

export function useI18n() {
    const { translations } = usePage().props;

    const t = (path) => {
        return path.split('.').reduce((acc, key) => acc?.[key], translations);
    };

    return { t };
}
