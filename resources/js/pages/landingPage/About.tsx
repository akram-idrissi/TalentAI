export default function About() {
    const steps = [
        {
            num: '01',
            title: 'Créez votre brief',
            desc: "Définissez le poste, les critères et les pondérations. RecruteAI structure votre besoin en référentiel d'analyse.",
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 8h8M7 11h5M7 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
        },
        {
            num: '02',
            title: 'Sourcing automatique',
            desc: "L'IA identifie les meilleurs profils en temps réel sur différentes plateformes.",
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 3c0 0 4 4 4 8s-4 8-4 8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 11h16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            ),
        },
        {
            num: '03',
            title: 'Analyse & scoring',
            desc: 'Chaque CV est analysé automatiquement et noté selon vos critères personnalisés.',
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M3 17l4-4 4 4 4-8 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        },
        {
            num: '04',
            title: 'Analyse des entretiens',
            desc: 'Transcription et analyse IA des entretiens pour détecter les soft skills.',
            icon: (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M8 3H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M15 3l4 4-8 8H7v-4l8-8z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            ),
        },
    ];

    return (
        <section id="about" className="bg-background relative overflow-hidden py-20 sm:py-24 lg:py-28">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-primary/10 absolute top-1/2 left-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* HEADER */}
                <div className="mb-14 max-w-2xl lg:mb-20">
                    <div className="border-border bg-card mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
                        <span className="text-primary text-xs font-semibold tracking-widest uppercase">Comment ça marche</span>
                    </div>

                    <h2 className="text-foreground text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
                        Un pipeline de recrutement{' '}
                        <span className="from-primary to-chart-3 bg-gradient-to-r bg-clip-text text-transparent">automatisé</span>
                    </h2>

                    <p className="text-muted-foreground mt-5 text-base leading-relaxed sm:text-lg">
                        De la définition du poste à la recommandation finale, RecruteAI automatise chaque étape du recrutement.
                    </p>
                </div>

                {/* STEPS */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, i) => (
                        <div key={i} className="border-border bg-card hover:bg-accent relative rounded-2xl border p-6 transition-all duration-300">
                            {/* step number */}
                            <span className="text-muted-foreground/20 absolute top-4 right-4 text-4xl font-bold">{step.num}</span>

                            {/* icon */}
                            <div className="bg-primary/10 text-primary mb-6 flex h-11 w-11 items-center justify-center rounded-xl">{step.icon}</div>

                            {/* title */}
                            <h3 className="text-foreground mb-2 text-lg font-semibold">{step.title}</h3>

                            {/* description */}
                            <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>

                {/* INTEGRATIONS */}
                <div className="border-border bg-card mt-16 rounded-2xl border p-6 sm:p-8 lg:mt-20">
                    <p className="text-muted-foreground mb-8 text-center text-xs font-semibold tracking-widest uppercase">Intégrations natives</p>

                    <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                        {['LinkedIn', 'Indeed', 'Facebook Jobs', 'Zoom', 'Google Meet', 'Teams', 'Claude AI', 'Whisper'].map((p) => (
                            <span key={p} className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
