export default function Hero() {
    return (
        <section className="bg-background relative flex min-h-screen items-center overflow-hidden pt-24">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="bg-primary/20 absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[120px]" />
                <div className="bg-chart-3/10 absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full blur-[120px]" />
                <div className="bg-primary/10 absolute bottom-0 left-1/3 h-[300px] w-[400px] rounded-full blur-[100px]" />

                {/* Grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* LEFT CONTENT */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-foreground text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
                            Recrutez les{' '}
                            <span className="from-primary to-chart-3 bg-gradient-to-r via-purple-500 bg-clip-text text-transparent">
                                meilleurs profils
                            </span>{' '}
                            grâce à l’IA
                        </h1>

                        <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-base sm:text-lg lg:mx-0">
                            RecruteAI automatise votre processus de recrutement : sourcing, analyse CV, entretiens IA et classement intelligent des
                            candidats.
                        </p>

                        {/* CTA */}
                        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                            <a href="#contact" className="bg-primary rounded-xl px-8 py-4 font-semibold text-white transition hover:opacity-90">
                                Voir la démo
                            </a>

                            <a
                                href="#about"
                                className="border-border bg-card text-foreground hover:bg-accent rounded-xl border px-8 py-4 font-semibold transition"
                            >
                                En savoir plus
                            </a>
                        </div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="relative hidden lg:block">
                        {/* Glow */}
                        <div className="bg-primary/20 absolute -inset-4 rounded-3xl blur-2xl" />

                        {/* Card */}
                        <div className="bg-card border-border relative overflow-hidden rounded-2xl border shadow-xl">
                            {/* Top bar */}
                            <div className="border-border flex items-center gap-2 border-b px-5 py-4">
                                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                                <span className="text-muted-foreground ml-3 text-xs">RecruteAI Dashboard</span>
                            </div>

                            <div className="space-y-4 p-6">
                                {/* KPI */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Profils', val: '1,284', color: 'primary' },
                                        { label: 'CV', val: '347', color: 'chart-3' },
                                        { label: 'Interviews', val: '89', color: 'purple' },
                                    ].map((k, i) => (
                                        <div key={i} className="bg-background border-border rounded-xl border p-3">
                                            <p className="text-muted-foreground text-xs">{k.label}</p>
                                            <p className="text-foreground text-lg font-bold">{k.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* List */}
                                <div className="border-border overflow-hidden rounded-xl border">
                                    <div className="border-border text-foreground border-b px-4 py-3 text-sm font-semibold">Top candidats</div>

                                    {[
                                        { name: 'Sarah El Mansouri', role: 'Senior Dev' },
                                        { name: 'Karim Benjelloun', role: 'Product Lead' },
                                        { name: 'Leila Tazi', role: 'Data Engineer' },
                                    ].map((c, i) => (
                                        <div key={i} className="border-border flex items-center justify-between border-b px-4 py-3 last:border-0">
                                            <div>
                                                <p className="text-foreground text-sm">{c.name}</p>
                                                <p className="text-muted-foreground text-xs">{c.role}</p>
                                            </div>
                                            <span className="text-primary text-xs">94%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="bg-card border-border absolute -bottom-4 -left-4 rounded-xl border px-4 py-3 shadow-lg">
                            <p className="text-foreground text-sm font-semibold">Candidat recommandé</p>
                            <p className="text-muted-foreground text-xs">Score IA: 94/100</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* bottom fade */}
            <div className="from-background absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent" />
        </section>
    );
}
