import { PaginationMeta } from '@/types';
export interface ActivityLogEntry {
    id: number;
    action: string;
    description: string;
    user_id: number | null;
    user_name: string | null;
    user_email: string | null;
    user_role: string | null;
    is_authenticated: boolean;
    controller: string | null;
    controller_method: string | null;
    http_method: string | null;
    url: string | null;
    ip_address: string | null;
    properties: Record<string, unknown> | null;
    models: string[] | null;
    logged_at: string;
}

export interface PageProps {
    logs: PaginationMeta & { data: ActivityLogEntry[] };
    actionGroups: string[];
    filters: {
        search: string;
        action: string;
        user: string;
        dateFrom: string;
        dateTo: string;
    };
}

export const ACTION_COLORS: Record<string, string> = {
    brief: 'bg-ds-accent/10 text-ds-accent2 border-ds-accent/20',
    users: 'bg-badge-active-bg text-badge-active-text border-badge-active-text/20',
    roles: 'bg-badge-interview-bg text-badge-interview-text border-badge-interview-text/20',
    candidate: 'bg-badge-sourcing-bg text-badge-sourcing-text border-badge-sourcing-text/20',
};

export const HTTP_COLORS: Record<string, string> = {
    GET: 'bg-ds-bg3 text-ds-text3 border-ds-border',
    POST: 'bg-badge-active-bg text-badge-active-text border-badge-active-text/20',
    PUT: 'bg-badge-interview-bg text-badge-interview-text border-badge-interview-text/20',
    PATCH: 'bg-badge-interview-bg text-badge-interview-text border-badge-interview-text/20',
    DELETE: 'bg-ds-red/10 text-ds-red border-ds-red/20',
};

export interface ShowPageProps {
    log: ActivityLogEntry;
}
