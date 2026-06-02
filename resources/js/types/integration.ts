export interface Integration {
    id: number;
    provider: string;
    label: string;
    category: string;
    icon: string;
    description: string;
    token_label: string;
    placeholder: string;
    env_key: string | null;
    test_url: string | null;
    docs_url: string | null;
    oauth: boolean;
    is_active: boolean;
    is_system: boolean;
    has_token: boolean;
    masked_token: string | null;
    has_env_fallback: boolean;
}

export interface IntegrationsProps {
    integrations: Record<string, Integration>;
    categoryLabels: Record<string, string>;
}

export interface AdminIntegrationsProps {
    integrations: Integration[];
}

export type ModalState =
    | { type: 'none' }
    | { type: 'create' }
    | { type: 'edit'; integration: Integration }
    | { type: 'delete'; integration: Integration };
