import { usePage } from '@inertiajs/react';

type Auth = {
    user: Record<string, unknown> | null;
    roles: string[];
    permissions: string[];
};

/**
 * usePermission()
 *
 * Provides helpers to check the current user's roles and permissions
 * that were shared from the backend via Inertia.
 *
 * Usage:
 *   const { can, hasRole, hasAnyRole } = usePermission();
 *
 *   can('briefs.create')               // true / false
 *   hasRole('recruiter')               // true / false
 *   hasAnyRole(['admin', 'recruiter']) // true if user has at least one
 */
export function usePermission() {
    const { auth } = usePage<{ auth: Auth }>().props;

    const permissions: string[] = auth?.permissions ?? [];
    const roles: string[] = auth?.roles ?? [];

    /** Check a single permission */
    const can = (permission: string): boolean => permissions.includes(permission);

    /** Check multiple permissions — returns true only if user has ALL */
    const canAll = (perms: string[]): boolean => perms.every((p) => permissions.includes(p));

    /** Check multiple permissions — returns true if user has ANY */
    const canAny = (perms: string[]): boolean => perms.some((p) => permissions.includes(p));

    /** Check a single role */
    const hasRole = (role: string): boolean => roles.includes(role);

    /** Check multiple roles — returns true if user has ANY */
    const hasAnyRole = (r: string[]): boolean => r.some((role) => roles.includes(role));

    /** Super admin check (bypasses everything) */
    const isSuperAdmin = (): boolean => roles.includes('super_admin');

    return { can, canAll, canAny, hasRole, hasAnyRole, isSuperAdmin };
}
