import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Brush, KeyRound, User } from 'lucide-react';
const sidebarNavItems: (Omit<NavItem, 'icon'> & { icon: LucideIcon })[] = [
    {
        title: 'Profil',
        url: '/settings/profile',
        icon: User,
    },
    {
        title: 'Mot de passe',
        url: '/settings/password',
        icon: KeyRound,
    },
    {
        title: 'Apparence',
        url: '/settings/appearance',
        icon: Brush,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <div className="bg-ds-bg min-h-screen">
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <aside className="border-ds-border bg-ds-surface w-full shrink-0 border-b lg:min-h-screen lg:w-56 lg:border-r lg:border-b-0">
                    <div className="px-3 py-4">
                        <p className="text-ds-text3 mb-2 px-2 text-[10px] font-semibold tracking-[0.8px] uppercase">Paramètres</p>
                        <nav className="flex flex-row gap-1 lg:flex-col">
                            {sidebarNavItems.map((item) => {
                                const isActive = currentPath === item.url;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.url}
                                        href={item.url}
                                        prefetch
                                        className={cn(
                                            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition',
                                            isActive ? 'bg-ds-accent/10 text-ds-accent' : 'text-ds-text2 hover:bg-ds-bg3 hover:text-ds-text',
                                        )}
                                    >
                                        <Icon size={14} />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content */}
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
