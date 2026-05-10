export interface Integration {
    provider: string;
    label: string;
    category: string;
    icon: string;
    description: string;
    token_label: string;
    placeholder: string;
    docs_url: string | null;
    oauth: boolean;
    has_token: boolean;
    masked_token: string | null;
    has_env_fallback: boolean;
}

export interface IntegrationsProps {
    integrations: Record<string, Integration>;
    categoryLabels: Record<string, string>;
}
