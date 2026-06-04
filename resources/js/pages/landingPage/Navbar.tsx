import { useTheme } from '@/hooks/useTheme';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { dark, toggleTheme } = useTheme();
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = ['Fonctionnalités', 'Solution', 'Tarifs', 'Ressources'];

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
                scrolled ? 'bg-background/80 border-border border-b backdrop-blur-xl' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <a href="#" className="group flex items-center gap-3">
                        <span className="text-foreground text-xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Recrute<span className="text-primary">AI</span>
                        </span>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden items-center gap-8 md:flex">
                        {links.map((l) => (
                            <a key={l} href="#" className="hover:text-foreground text-sm font-medium text-slate-400 transition-colors duration-200">
                                {l}
                            </a>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        <button
                            onClick={toggleTheme}
                            className="bg-card border-border text-foreground hover:bg-accent flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-primary text-primary-foreground rounded-xl px-5 py-2 text-sm font-medium transition hover:opacity-90"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="border-border text-foreground hover:bg-accent rounded-xl border px-4 py-2 transition"
                                >
                                    Connexion
                                </Link>

                                <Link
                                    href={route('register')}
                                    className="bg-primary text-primary-foreground rounded-xl px-4 py-2 transition hover:opacity-90"
                                >
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Burger */}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="text-foreground hover:text-primary transition-colors md:hidden">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="border-border bg-card mt-2 rounded-2xl border p-4 shadow-xl backdrop-blur-xl md:hidden">
                        <div className="flex flex-col gap-2">
                            {links.map((link) => (
                                <a
                                    key={link}
                                    href="#"
                                    className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl px-4 py-3 transition-all"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>

                        <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-primary text-primary-foreground w-full rounded-xl px-4 py-3 text-center"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="border-border hover:bg-accent w-full rounded-xl border px-4 py-3 text-center"
                                    >
                                        Connexion
                                    </Link>

                                    <Link
                                        href={route('register')}
                                        className="bg-primary text-primary-foreground w-full rounded-xl px-4 py-3 text-center"
                                    >
                                        Inscription
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
