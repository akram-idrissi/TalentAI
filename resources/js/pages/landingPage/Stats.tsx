export default function Stats() {
    const stats = [
        { value: '10×', label: 'Réduction du temps de sourcing', sub: 'vs processus manuel' },
        { value: '95%', label: 'Précision IA', sub: 'analyse automatisée' },
        { value: '500+', label: 'Recruteurs actifs', sub: 'cabinets & entreprises' },
        { value: '2 min', label: 'Analyse d’un CV', sub: 'extraction + scoring IA' },
    ];

    const benefits = [
        {
            title: 'Objectivité garantie',
            desc: 'Évaluation standardisée sans biais humains grâce à l’IA.',
        },
        {
            title: 'Gain de temps',
            desc: 'Automatisation complète du sourcing et de l’analyse CV.',
        },
        {
            title: 'Rapports exportables',
            desc: 'Génération automatique de rapports PDF structurés.',
        },
        {
            title: 'Classement intelligent',
            desc: 'Comparaison instantanée de tous les candidats.',
        },
        {
            title: 'Multi-plateformes',
            desc: 'LinkedIn, Indeed, Zoom, Teams intégrés.',
        },
        {
            title: 'SaaS instantané',
            desc: 'Accès direct sans infrastructure à gérer.',
        },
    ];

    return (
        <section id="benefits" className="bg-background relative overflow-hidden py-20 lg:py-28">
            {/* background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-primary/10 absolute top-0 right-1/4 h-[300px] w-[500px] rounded-full blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* STATS */}
                <div className="mb-20 grid grid-cols-2 gap-6 lg:mb-28 lg:grid-cols-4">
                    {stats.map((s, i) => (
                        <div key={i} className="border-border bg-card hover:bg-accent rounded-2xl border p-6 text-center transition-all duration-300">
                            <div className="text-foreground text-3xl font-bold lg:text-4xl">{s.value}</div>

                            <div className="text-foreground mt-2 text-sm font-medium">{s.label}</div>

                            <div className="text-muted-foreground mt-1 text-xs">{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* HEADER */}
                <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-16">
                    <div className="border-border bg-card mb-6 inline-flex items-center rounded-full border px-4 py-1.5">
                        <span className="text-primary text-xs font-semibold tracking-widest uppercase">Avantages</span>
                    </div>

                    <h2 className="text-foreground text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                        Pourquoi choisir <span className="from-primary to-chart-3 bg-gradient-to-r bg-clip-text text-transparent">RecruteAI ?</span>
                    </h2>

                    <p className="text-muted-foreground mt-4 text-base lg:text-lg">Une solution conçue pour les recruteurs modernes.</p>
                </div>

                {/* BENEFITS GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {benefits.map((b, i) => (
                        <div key={i} className="border-border bg-card hover:bg-accent rounded-2xl border p-6 transition-all duration-300">
                            <h3 className="text-foreground mb-2 text-lg font-semibold">{b.title}</h3>

                            <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
