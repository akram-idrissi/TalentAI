import { useI18n } from '@/hooks/useI18n';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, FileText, LayoutDashboard, Mic, PanelLeftClose, PanelLeftOpen, Search, Settings, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { url } = usePage();
    const { t } = useI18n();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return JSON.parse(localStorage.getItem('sidebar-collapsed')) ?? false;
    });

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);
    const router = route();

    const isActive = (name) => router.current(name) || router.current(`${name}.*`);

    // MENU SECTIONS
    const sections = useMemo(
        () => [
            {
                title: t('sidebar.dashboard.title'),
                items: [
                    {
                        id: 'dashboard',
                        label: t('sidebar.dashboard.overview'),
                        icon: LayoutDashboard,
                        route: 'dashboard',
                    },
                ],
            },
            {
                title: t('sidebar.sourcing.title'),
                items: [
                    {
                        id: 'brief',
                        label: t('sidebar.sourcing.brief'),
                        icon: FileText,
                        route: 'briefs.index',
                    },
                    {
                        id: 'sourcing',
                        label: t('sidebar.sourcing.auto'),
                        icon: Search,
                        route: 'dashboard',
                    },
                ],
            },
            {
                title: t('sidebar.interviews.title'),
                items: [
                    {
                        id: 'interviews',
                        label: t('sidebar.interviews.list'),
                        icon: Mic,
                        route: 'dashboard',
                    },
                    {
                        id: 'reports',
                        label: t('sidebar.interviews.reports'),
                        icon: BarChart3,
                        route: 'dashboard',
                    },
                ],
            },
            {
                title: t('sidebar.settings.title'),
                items: [
                    {
                        id: 'settings',
                        label: t('sidebar.settings.integrations'),
                        icon: Settings,
                        route: 'dashboard',
                    },
                ],
            },
        ],
        [t],
    );

    return (
        <>
            {mobileOpen && <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)}></div>}
            <aside
                className={`fixed z-50 flex h-screen flex-col border-r transition-all duration-300 md:static ${collapsed ? 'md:w-[90px]' : 'md:w-[300px]'} w-[300px] md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} bg-white dark:bg-[#111118]`}
                aria-label="Sidebar navigation"
            >
                {/* TOP HEADER */}

                <div className="relative flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-white/10">
                    {/* LOGO */}
                    {!collapsed && (
                        <div>
                            <h1 className="text-[26px] font-extrabold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                                Talent<span className="text-secondary">AI</span>
                            </h1>
                            <p className="text-[11px] tracking-wider text-gray-400 uppercase">Recrutement Intelligent</p>
                        </div>
                    )}

                    {/* DESKTOP COLLAPSE BUTTON */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden rounded-lg p-2 hover:bg-gray-100 md:flex dark:hover:bg-[#1E1E28]"
                        aria-label="Toggle sidebar collapse"
                    >
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>

                    {/* MOBILE CLOSE BUTTON */}
                    {mobileOpen && (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-3 right-3 rounded-lg bg-gray-100/80 p-2 shadow-sm hover:bg-gray-200 md:hidden dark:bg-[#1E1E28]/80 dark:hover:bg-[#2A2A36]"
                            aria-label="Close navigation menu"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* MENU */}

                <nav className="custom-scroll flex-1 overflow-y-auto py-4">
                    {sections.map((section, i) => (
                        <div key={i} className="mb-4">
                            {/* SECTION TITLE */}
                            {!collapsed && (
                                <div className="mb-2 px-5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">{section.title}</div>
                            )}

                            {/* ITEMS */}
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.id}
                                        title={collapsed ? item.label : undefined}
                                        aria-label={item.label}
                                        href={route(item.route)}
                                        className={`flex items-center gap-3 border-l-2 px-5 py-2 transition-all ${
                                            isActive(item.route)
                                                ? 'bg-secondary/10 border-secondary text-secondary font-medium'
                                                : 'hover:bg-secondary/5 hover:text-secondary border-transparent text-gray-400'
                                        }`}
                                        aria-current={isActive(item.route) ? 'page' : undefined}
                                    >
                                        <Icon size={18} />
                                        {!collapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}

                            {/* DIVIDER */}
                            {i !== sections.length - 1 && <div className="mt-3 border-b border-gray-100 dark:border-white/5" />}
                        </div>
                    ))}
                </nav>

                {/* USER */}
                <div className="border-t border-gray-200 p-4 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="from-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br to-cyan-400 text-xs font-bold text-white">
                            SA
                        </div>

                        {!collapsed && (
                            <div>
                                <p className="text-sm font-medium">Said Isium</p>
                                <p className="text-xs text-gray-400">Admin RH</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
