export type RoleUser = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
};

export type Role = {
    id: number;
    name: string;
    users_count: number;
    users: RoleUser[];
    permissions: string[];
};

type AllPermissions = Record<string, string[]>;

export type PageProps = {
    roles: Role[];
    allPermissions: AllPermissions;
    filters?: { role?: string; permissions?: string[] };
    flash: { success?: string; error?: string };
};

export type EditRolePageProps = {
    role: Omit<Role, 'users' | 'users_count'>;
    allPermissions: AllPermissions;
    flash: { success?: string; error?: string };
};
