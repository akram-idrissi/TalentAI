import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Registers a browser beforeunload warning and an Inertia navigation guard
 * whenever `isDirty` is true.
 *
 * Returns a `confirmLeave()` helper you can call before programmatic
 * navigations that bypass the Inertia guard (e.g. router.post redirects).
 */
export function useUnsavedChanges(isDirty: boolean) {
    const isDirtyRef = useRef(isDirty);
    isDirtyRef.current = isDirty;

    useEffect(() => {
        function handleBeforeUnload(e: BeforeUnloadEvent) {
            if (!isDirtyRef.current) return;
            e.preventDefault();
            e.returnValue = '';
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    useEffect(() => {
        const removeHandler = router.on('before', (event) => {
            if (!isDirtyRef.current) return;

            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');

            if (!confirmed) {
                event.preventDefault();
            }
        });

        return removeHandler;
    }, []);

    /**
     * Imperative escape hatch: call this before a programmatic navigation
     * you control (e.g. after a successful save) to skip the guard.
     * In practice you'll call `markClean()` instead — this is a direct alias.
     */
    const confirmLeave = useCallback(() => {
        isDirtyRef.current = false;
    }, []);

    return { confirmLeave };
}
