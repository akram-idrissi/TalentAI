import type { BriefFormData } from '@/types/brief';
import { useCallback, useEffect, useRef, useState } from 'react';

const AUTOSAVE_DEBOUNCE_MS = 30_000; // 30 s
const STORAGE_PREFIX = 'brief_draft_';

interface AutosaveOptions {
    key: string;
    data: BriefFormData;
    isDirty: boolean;
    onRestore: (saved: BriefFormData) => void;
}

interface AutosaveReturn {
    hasRestorableData: boolean;
    restore: () => void;
    dismissRestore: () => void;
    clearSaved: () => void;
    lastSavedAt: string | null;
}

export function useAutosave({ key, data, isDirty, onRestore }: AutosaveOptions): AutosaveReturn {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dataRef = useRef(data);
    dataRef.current = data;

    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

    const [hasRestorableData, setHasRestorableData] = useState<boolean>(() => {
        try {
            return !!localStorage.getItem(storageKey);
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (!isDirty) return;

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            try {
                const payload = {
                    data: dataRef.current,
                    savedAt: new Date().toISOString(),
                };
                localStorage.setItem(storageKey, JSON.stringify(payload));
                setLastSavedAt(payload.savedAt);
            } catch {
                // localStorage full or unavailable — silently ignore.
            }
        }, AUTOSAVE_DEBOUNCE_MS);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isDirty, data, storageKey]);

    const restore = useCallback(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const { data: savedData } = JSON.parse(raw) as {
                data: BriefFormData;
                savedAt: string;
            };
            onRestore(savedData);
            setHasRestorableData(false);
        } catch {
            setHasRestorableData(false);
        }
    }, [storageKey, onRestore]);

    const dismissRestore = useCallback(() => {
        setHasRestorableData(false);
        localStorage.removeItem(storageKey);
    }, []);

    const clearSaved = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // ignore
        }
        setHasRestorableData(false);
        setLastSavedAt(null);
    }, [storageKey]);

    return { hasRestorableData, restore, dismissRestore, clearSaved, lastSavedAt };
}
