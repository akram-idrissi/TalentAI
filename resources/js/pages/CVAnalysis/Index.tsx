import FilterPanel, { FilterEntry } from '@/components/ui/FilterPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Brain, Briefcase, FileSearch, Plus, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Brief {
    id: number;
    title: string;
    required_skills: string;
}

interface Analysis {
    id: number;
    score_global: number | null;
    ai_summary: string | null;
    ai_summary_en: string | null;
    ai_tags: string[] | null;
    cv_file_path: string;
    candidate: { full_name: string } | null;
    brief: Brief | null;
    extracted_text: { technical_skills: string[] };
}

interface PageFilters {
    search?: string;
    brief_id?: string;
}

interface PageProps {
    analyses: Analysis[];
    briefs: Brief[];
    filters: PageFilters;
}

const SCORE_COLORS = [
    'from-[#6C63FF] to-[#8B5CF6]',
    'from-[#38BDF8] to-[#0EA5E9]',
    'from-[#34D399] to-[#10B981]',
    'from-[#F59E0B] to-[#F97316]',
    'from-[#F87171] to-[#EF4444]',
];

function getScoreColor(score: number) {
    if (score >= 80) return 'text-[#34D399]';
    if (score >= 60) return 'text-[#F59E0B]';
    return 'text-[#F87171]';
}

function initials(name: string) {
    return name
        ?.split(' ')
        ?.slice(0, 2)
        ?.map((w: string) => w[0])
        ?.join('')
        ?.toUpperCase();
}

export default function Index() {
    const { analyses, briefs, filters } = usePage().props as unknown as PageProps;
    const { t } = useI18n();
    const [selected, setSelected] = useState<Analysis | null>(analyses?.[0] ?? null);
    const [lang, setLang] = useState('fr');
    const [loading, setLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterEntry[]>(Array.isArray(filters) ? filters : []);

    const FILTER_FIELDS = [
        { key: 'full_name', label: t('candidats.index.filters.full_name'), type: 'text' as const },
        { key: 'score', label: t('briefs.classement.filters.score'), type: 'number' as const },
        { key: 'extracted_text.technical_skills', label: t('briefs.classement.filters.skills'), type: 'text' as const },
        {
            key: 'brief',
            label: t('briefs.classement.filters.brief'),
            type: 'select' as const,
            options: briefs.map((b) => ({ value: String(b.id), label: b.title })),
        },
    ];

    function handleSearch(filtersOverride?: FilterEntry[]) {
        const toSearch = filtersOverride ?? activeFilters;
        const cleanFilters = toSearch
            .filter((f) => (Array.isArray(f.value) ? f.value.length > 0 : f.value && String(f.value).trim() !== ''))
            .map((f) => ({ field: f.field, value: Array.isArray(f.value) ? f.value.join(',') : f.value }));

        router.get(
            route('dashboard.cv-analysis.index'),
            { filters: JSON.stringify(cleanFilters) },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
                onSuccess: (page) => {
                    const count = (page.props as { analyses?: unknown[] }).analyses?.length ?? 0;
                    toast.success(`${count} analyse${count !== 1 ? 's' : ''} trouvée${count !== 1 ? 's' : ''}`);
                },
                onError: () => toast.error('Erreur lors de la recherche'),
            },
        );
    }

    const parsedTags = useMemo(() => {
        if (!selected?.ai_tags) return [];

        if (Array.isArray(selected.ai_tags)) {
            return selected.ai_tags;
        }

        return [];
    }, [selected]);

    return (
        <>
            <Head title="CV Analyses" />

            <AppLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-6">
                    {/* HEADER */}
                    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-ds-text3 text-xs">Recruitment › CV Analysis</p>

                            <h1 className="mt-1 text-3xl font-bold">Analyses CV IA</h1>

                            <p className="text-ds-text2 mt-1 text-sm">Analyse intelligente des candidats.</p>
                        </div>

                        <button
                            onClick={() => router.get(route('dashboard.cv-analysis.create'))}
                            className="flex items-center gap-2 rounded-2xl bg-[#6C63FF] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Plus size={16} />
                            Nouvelle Analyse
                        </button>
                    </div>

                    {/* FILTERS */}
                    <div className="mb-5">
                        <FilterPanel
                            fields={FILTER_FIELDS}
                            activeFilters={activeFilters}
                            onChange={setActiveFilters}
                            onSearch={handleSearch}
                            loading={loading}
                        />
                    </div>

                    {/* Skeleton while loading */}
                    {loading && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-4 lg:col-span-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="border-ds-border bg-ds-surface rounded-3xl border p-5">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="bg-ds-bg3 h-14 w-14 shrink-0 rounded-full" />
                                            <div className="flex-1 space-y-2 pt-1">
                                                <Skeleton className="bg-ds-bg3 h-4 w-2/3" />
                                                <Skeleton className="bg-ds-bg3 h-3 w-1/2" />
                                                <Skeleton className="bg-ds-bg3 h-3 w-3/4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-ds-border bg-ds-surface space-y-4 rounded-3xl border p-6">
                                <Skeleton className="bg-ds-bg3 mx-auto h-16 w-16 rounded-full" />
                                <Skeleton className="bg-ds-bg3 mx-auto h-4 w-3/4" />
                                <Skeleton className="bg-ds-bg3 mx-auto h-3 w-1/2" />
                                <Skeleton className="bg-ds-bg3 h-24 w-full rounded-xl" />
                            </div>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && (!analyses || analyses.length === 0) && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-3xl border py-28 text-center">
                            <FileSearch size={60} className="text-ds-text3 mb-4" />

                            <h2 className="text-xl font-bold">Aucun résultat</h2>

                            <p className="text-ds-text2 mt-2 text-sm">Aucun candidat trouvé.</p>
                        </div>
                    )}

                    {/* CONTENT */}
                    {!loading && analyses?.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* LEFT */}
                            <div className="space-y-4 lg:col-span-2">
                                {analyses.map((item: Analysis, index: number) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelected(item)}
                                        className={`cursor-pointer rounded-3xl border p-5 transition-all duration-200 ${
                                            selected?.id === item.id
                                                ? 'border-[#6C63FF]/50 bg-[#6C63FF]/10 shadow-[0_0_0_1px_rgba(108,99,255,0.3)]'
                                                : 'border-ds-border bg-ds-surface hover:border-ds-border2 hover:bg-ds-bg3'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* AVATAR */}
                                            <div
                                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                                                    SCORE_COLORS[index % SCORE_COLORS.length]
                                                }`}
                                            >
                                                {initials(item.candidate?.full_name ?? 'U')}
                                            </div>

                                            {/* INFO */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h2 className="truncate text-lg font-bold">{item.candidate?.full_name}</h2>

                                                        <div className="text-ds-text2 mt-1 flex flex-wrap items-center gap-3 text-xs">
                                                            <div className="flex items-center gap-1">
                                                                <Briefcase size={13} />
                                                                {item.brief?.title}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SCORE */}
                                                    <div className="text-right">
                                                        <p className={`text-3xl font-extrabold ${getScoreColor(item.score_global ?? 0)}`}>
                                                            {item.score_global ?? 0}
                                                        </p>

                                                        <p className="text-ds-text3 text-xs">/100</p>
                                                    </div>
                                                </div>

                                                {/* SUMMARY */}
                                                {item.ai_summary && (
                                                    <p className="text-ds-text2 mt-4 line-clamp-2 text-sm leading-relaxed">{item.ai_summary}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT */}
                            {selected && (
                                <div className="space-y-5">
                                    {/* CARD */}
                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="border-ds-border border-b pb-5 text-center">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#38BDF8] text-2xl font-bold text-white">
                                                {initials(selected.candidate?.full_name ?? '')}
                                            </div>

                                            <h2 className="mt-4 text-xl font-bold">{selected.candidate?.full_name}</h2>

                                            <p className="text-ds-text2 mt-1 text-sm">{selected.brief?.title}</p>

                                            <div className={`mt-5 text-6xl font-extrabold ${getScoreColor(selected.score_global ?? 0)}`}>
                                                {selected.score_global ?? 0}
                                            </div>

                                            <p className="text-ds-text3 mt-1 text-xs">Score global IA</p>
                                        </div>

                                        {/* ANALYSIS */}
                                        <div className="mt-5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Brain size={18} className="text-[#6C63FF]" />

                                                <h3 className="font-bold">Analyse IA</h3>
                                            </div>
                                            <a
                                                href={`${selected.cv_file_path}`}
                                                target="_blank"
                                                className="bg-ds-accent border-ds-border hover:bg-ds-accent2 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold text-white transition"
                                            >
                                                Voir CV
                                            </a>

                                            <p className="text-ds-text2 py-4 text-sm leading-relaxed">
                                                {lang === 'fr' ? selected.ai_summary : selected.ai_summary_en}
                                            </p>
                                            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="mt-4 text-xs text-indigo-500">
                                                {lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* TAGS */}
                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F59E0B]" />

                                            <h3 className="font-bold">Skills détectés</h3>
                                        </div>

                                        {parsedTags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {parsedTags.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-xl border px-3 py-1.5 text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-ds-text3 text-sm">Aucun skill détecté.</p>
                                        )}
                                    </div>

                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F59E0B]" />

                                            <h3 className="font-bold">Skills CV</h3>
                                        </div>

                                        {selected?.extracted_text?.technical_skills?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {selected.extracted_text.technical_skills.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-xl border px-3 py-1.5 text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-ds-text3 text-sm">Aucun skill détecté.</p>
                                        )}
                                    </div>

                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F59E0B]" />

                                            <h3 className="font-bold">Skills Brif</h3>
                                        </div>

                                        {(selected?.brief?.required_skills?.length ?? 0) > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-ds-text2">{selected.brief?.required_skills}</p>
                                            </div>
                                        ) : (
                                            <p className="text-ds-text3 text-sm">Aucun skill détecté.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
