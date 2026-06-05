import { ALL_COLUMNS, STORAGE_KEY, type ColKey } from '@/constants/briefs';

export function loadVisibleCols(): Set<ColKey> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: ColKey[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return new Set(parsed);
        }
    } catch {
        /* ignore */
    }
    return new Set(ALL_COLUMNS.map((c) => c.key));
}

export function saveVisibleCols(cols: Set<ColKey>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(cols)));
    } catch {
        /* ignore */
    }
}
