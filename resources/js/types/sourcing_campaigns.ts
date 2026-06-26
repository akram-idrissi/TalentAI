export interface Brief {
    id: number;
    title: string;
}

export type SelectOption = {
    value: string;
    label: string;
};

export interface FormData {
    target_urls: SelectOption[];
    max_posts: string;
    posted_limit_date: string;
    brief_id: string;
}

export interface Props {
    briefs: Brief[];
    params: {
        sourcing_social_platforms: SelectOption[];
    };
}

interface SourcingCampaign {
    id: number;
    created_at: string;
    target_urls: string[];
    posts_count: number;
    candidats_count: number;
    status: string;
    brief?: { title: string } | null;
}

export interface IndexProps {
    sourcingCampaigns: {
        data: SourcingCampaign[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
}

export interface Candidat {
    id: number;
    full_name: string | null;
    current_title: string | null;
    status: string;
}

export interface Comment {
    id: number;
    commenter_name: string | null;
    commenter_linkedin_url: string | null;
    commenter_position: string | null;
    commentary: string;
    candidat: Candidat | null;
}

export interface Post {
    id: number;
    author_name: string | null;
    author_linkedin_url: string | null;
    author_info: string | null;
    content: string;
    linkedin_url: string | null;
    comments: Comment[];
}

interface SourcingCampaign {
    id: number;
    status: string;
    target_urls: string[];
    posts: Post[];
    error_message: string | null;
}

export interface EnrichmentStats {
    total: number;
    enriched: number;
    done: boolean;
}

export interface ShowProps {
    sourcingCampaign: SourcingCampaign;
    enrichment: EnrichmentStats;
}
