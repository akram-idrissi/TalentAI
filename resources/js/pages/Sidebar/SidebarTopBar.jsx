import Select from '@/components/Select';
import { useTheme } from '@/hooks/useTheme';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Moon, Search, Sun } from 'lucide-react';
import { useState } from 'react';
export default function SidebarTopBar({ setMobileOpen }) {
    console.log(setMobileOpen);

    const [collapsed] = useState(false);

    const { dark, toggleTheme } = useTheme();
    const { locale } = usePage().props;

    const setLang = async (lang) => {
        await axios.post('/locale', { locale: lang });
        window.location.reload();
    };

    return (
        <div className="border-b border-gray-200 px-10 py-3 dark:border-white/10">
            <div className="flex items-center justify-between gap-3">
                {/* MOBILE SIDEBAR TOGGLE */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="rounded-lg bg-gray-100 p-2 transition hover:scale-105 md:hidden dark:bg-[#1E1E28]"
                    aria-label="Open sidebar"
                >
                    <svg className="h-5 w-5 text-gray-700 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {/* LEFT - SEARCH */}
                {!collapsed && (
                    <div className="flex max-w-[620px] flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-[#1E1E28]">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-transparent text-sm text-gray-700 outline-none dark:text-white"
                        />
                    </div>
                )}

                {/* CENTER */}
                <div className="flex items-center gap-4">
                    {!collapsed && (
                        <Select
                            value={locale}
                            onChange={setLang}
                            placeholder="Select language"
                            options={[
                                { value: 'fr', label: 'Fr' },
                                { value: 'en', label: 'En' },
                            ]}
                        />
                    )}
                </div>

                {/* RIGHT - DARK MODE */}

                <button onClick={toggleTheme} className="rounded-lg bg-gray-100 p-2 transition hover:scale-105 dark:bg-[#1E1E28]">
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
            </div>
        </div>
    );
}
