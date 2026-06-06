export default function Footer() {
    const links = {
        Produit: ['Fonctionnalités', 'Tarifs', 'Roadmap', 'Changelog'],
        Solution: ['Recruteurs', 'DRH', 'Cabinets', "Cas d'usage"],
        Ressources: ['Documentation', 'Blog', 'API', 'Support'],
        Entreprise: ['À propos', 'Carrières', 'Contact'],
    };

    const year = new Date().getFullYear();

    return (
        <footer className="bg-background border-border border-t">
            {/* CTA */}
            <div className="relative overflow-hidden">
                <div className="from-primary/10 via-primary/5 to-chart-3/10 pointer-events-none absolute inset-0 bg-gradient-to-r" />

                <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-14 lg:flex-row lg:items-center lg:px-8 lg:py-16">
                    <div>
                        <h3 className="text-foreground text-xl font-bold lg:text-3xl">Prêt à recruter plus intelligemment ?</h3>

                        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                            Rejoignez les équipes qui automatisent déjà leur recrutement.
                        </p>
                    </div>

                    <a
                        href="#contact"
                        className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                    >
                        Voir la démo →
                    </a>
                </div>
            </div>

            {/* MAIN */}
            <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-1">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-foreground text-lg font-bold">
                                Recrute<span className="text-primary">AI</span>
                            </span>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Plateforme IA de recrutement automatisée pour les équipes modernes.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h4 className="text-foreground mb-4 text-sm font-semibold">{title}</h4>

                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition">
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* BOTTOM */}
                <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row">
                    <p className="text-muted-foreground text-xs">© {year} RecruteAI. Tous droits réservés.</p>

                    <div className="flex gap-5 text-xs">
                        <a className="text-muted-foreground hover:text-foreground" href="#">
                            Confidentialité
                        </a>
                        <a className="text-muted-foreground hover:text-foreground" href="#">
                            CGU
                        </a>
                        <a className="text-muted-foreground hover:text-foreground" href="#">
                            RGPD
                        </a>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                        Système opérationnel
                    </div>
                </div>
            </div>
        </footer>
    );
}
