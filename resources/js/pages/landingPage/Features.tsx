export default function Features() {
    const features = [
        {
            tag: 'Module 01',
            title: 'Gestion des Briefs',
            desc: 'Créez des fiches de poste structurées avec critères pondérés.',
            bullets: ['Critères multi-dimensionnels', 'Scoring personnalisé', 'Historique des briefs', 'Sourcing automatique'],
        },
        {
            tag: 'Module 02',
            title: 'Sourcing Automatisé',
            desc: 'Connexion aux plateformes et extraction automatique des profils.',
            bullets: ['APIs multi-plateformes', 'Filtrage intelligent', 'Alertes temps réel', 'Matching automatique'],
        },
        {
            tag: 'Module 03',
            title: 'Analyse de CV IA',
            desc: 'Analyse automatique des CVs avec scoring intelligent.',
            bullets: ['Import PDF / DOCX', 'Score 0–100', 'Analyse expérience & skills', 'Classement automatique'],
        },
        {
            tag: 'Module 04',
            title: 'Intelligence Entretien',
            desc: 'Analyse des entretiens avec transcription IA.',
            bullets: ['Transcription automatique', 'Analyse soft skills', 'Rapports PDF', 'Comparaison candidats'],
        },
    ];

    const verdicts = [
        { label: 'Recommandé', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        { label: 'Solide', color: 'bg-primary/10 text-primary border-primary/20' },
        { label: 'À revoir', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { label: 'Écarté', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    ];

    return (
        <section id="features" className="bg-background relative overflow-hidden py-20 lg:py-28">
            {/* background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-primary/10 absolute right-0 bottom-0 h-[400px] w-[500px] rounded-full blur-[120px]" />
                <div className="bg-chart-3/10 absolute top-0 left-0 h-[400px] w-[400px] rounded-full blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* HEADER */}
                <div className="mx-auto mb-14 max-w-2xl text-center lg:mb-20">
                    <div className="border-border bg-card mb-6 inline-flex items-center rounded-full border px-4 py-1.5">
                        <span className="text-primary text-xs font-semibold tracking-widest uppercase">Fonctionnalités</span>
                    </div>

                    <h2 className="text-foreground text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                        Tout ce dont vous avez besoin{' '}
                        <span className="from-primary to-chart-3 bg-gradient-to-r bg-clip-text text-transparent">dans un seul outil</span>
                    </h2>

                    <p className="text-muted-foreground mt-4 text-base lg:text-lg">Modules IA interconnectés pour automatiser tout le recrutement.</p>
                </div>

                {/* FEATURES GRID */}
                <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="border-border bg-card hover:bg-accent relative rounded-2xl border p-6 transition-all duration-300 lg:p-8"
                        >
                            {/* tag */}
                            <span className="text-primary text-xs font-semibold tracking-widest uppercase">{f.tag}</span>

                            {/* title */}
                            <h3 className="text-foreground mt-3 text-xl font-bold">{f.title}</h3>

                            {/* desc */}
                            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{f.desc}</p>

                            {/* bullets */}
                            <ul className="mt-6 space-y-2">
                                {f.bullets.map((b, j) => (
                                    <li key={j} className="text-muted-foreground flex items-start gap-2 text-sm">
                                        <span className="bg-primary mt-1 h-1.5 w-1.5 rounded-full" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* VERDICTS */}
                <div className="border-border bg-card rounded-2xl border p-6 lg:p-10">
                    <div className="grid items-center gap-8 lg:grid-cols-2">
                        {/* LEFT */}
                        <div>
                            <span className="text-primary text-xs font-semibold tracking-widest uppercase">Système IA</span>

                            <h3 className="text-foreground mt-4 text-2xl font-bold lg:text-3xl">Verdict intelligent des candidats</h3>

                            <p className="text-muted-foreground mt-4 leading-relaxed">
                                Chaque candidat reçoit une évaluation basée sur des données objectives issues du CV et des entretiens.
                            </p>
                        </div>

                        {/* RIGHT */}
                        <div className="grid grid-cols-2 gap-3">
                            {verdicts.map((v, i) => (
                                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${v.color} `}>
                                    <span className="h-2 w-2 rounded-full bg-current" />
                                    <span className="text-sm font-medium">{v.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
