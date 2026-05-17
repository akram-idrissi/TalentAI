export const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    recruiter: 'Recruiter',
    hiring_manager: 'Hiring Manager',
    viewer: 'Viewer',
};

export const ROLE_COLORS: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    recruiter: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    hiring_manager: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export const MODULE_LABELS: Record<string, string> = {
    briefs: 'Briefs',
    sourcing: 'Sourcing',
    candidates: 'Candidates',
    interviews: 'Interviews',
    reports: 'Reports',
    integrations: 'Integrations',
    classement: 'Classement',
    users: 'Users',
    roles: 'Roles',
    settings: 'Settings',
};

export const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
];
