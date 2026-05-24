export type User = {
    id: number;
    name: string;
    full_name: string | null;
    email: string;
    roles: string[];
    last_login_at: string | null;
    created_at: string;
    is_active: boolean;
};

export type Role = { id: number; name: string };

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type PageProps = {
    users: Paginated<User>;
    roles: Role[];
    flash: { success?: string; error?: string };
    auth: { user: { id: number } };
    filters: { search?: string; email?: string; role?: string };
};
