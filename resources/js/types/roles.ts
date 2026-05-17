export type Role = {
    id: number;
    name: string;
    users_count: number;
    permissions: string[];
};

type AllPermissions = Record<string, string[]>;

export type PageProps = {
    roles: Role[];
    allPermissions: AllPermissions;
    flash: { success?: string; error?: string };
};
