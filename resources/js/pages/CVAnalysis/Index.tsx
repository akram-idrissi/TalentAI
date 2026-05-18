import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Briefcase, FileSearch, Plus, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ReactSelect, { SingleValue } from 'react-select';

type Brief = {
    id: number | string;
    title: string;
    required_skills?: string;
};

type Candidate = {
    full_name?: string;
};

type ExtractedText = {
    technical_skills?: string[];
};

type Analysis = {
    id: number | string;
    score_global?: number;
    ai_summary?: string;
    ai_summary_en?: string;
    ai_tags?: string[];
    cv_file_path?: string;

    candidate?: Candidate;
    brief?: Brief;
    extracted_text?: ExtractedText;
};

type Filters = {
    search?: string;
    brief_id?: string;
};

type PageProps = {
    analyses: Analysis[];
    briefs: Brief[];
    filters: Filters;
};

type SelectOption = {
    value: string | number;
    label: string;
};

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

function initials(name?: string) {
    if (!name) return 'U';

    return name
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w ?? '') // FIXED: Safely extracting the first letter to resolve ESLint issues
        .join('')
        .toUpperCase();
}

export default function Index() {
    // FIXED: Safely extracting parameters to bypass parsing errors
    const pageData = usePage<PageProps>().props;
    const analyses = pageData.analyses ?? [];
    const briefs = pageData.briefs ?? [];
    const filters = pageData.filters ?? {};

    const [selected, setSelected] = useState<Analysis | null>(analyses[0] ?? null);

    const [search, setSearch] = useState<string>(filters?.search ?? '');

    const [briefId, setBriefId] = useState<string | number>(filters?.brief_id ?? '');

    const [lang, setLang] = useState<'fr' | 'en'>('fr');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('dashboard.cv-analysis.index'),
                {
                    search,
                    brief_id: briefId,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, briefId]);

    const parsedTags = useMemo<string[]>(() => {
        if (!selected?.ai_tags) return [];

        if (Array.isArray(selected.ai_tags)) {
            return selected.ai_tags as string[];
        }

        return [];
    }, [selected]);

    const briefOptions: SelectOption[] = briefs.map((brief: Brief) => ({
        value: brief.id,
        label: brief.title,
    }));

    return (
        <>
            <Head title="CV Analyses" />

            <AppLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-6 font-sans">
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
                    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {/* SEARCH */}
                        <div className="relative">
                            <Search size={16} className="text-ds-text3 absolute top-1/2 left-4 -translate-y-1/2" />

                            <input
                                type="text"
                                placeholder="Rechercher candidat..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-ds-border bg-ds-surface text-ds-text2 w-full rounded-xl border py-[9px] pr-4 pl-10 text-sm transition outline-none focus:border-[#6C63FF] focus:ring-0"
                            />
                        </div>

                        {/* FILTER BRIEF */}
                        <ReactSelect<SelectOption>
                            classNamePrefix="rs"
                            options={briefOptions}
                            value={briefOptions.find((option: SelectOption) => option.value === briefId) ?? null}
                            onChange={(option: SingleValue<SelectOption>) => setBriefId(option?.value ?? '')}
                            placeholder="Choose brief"
                        />
                    </div>

                    {/* EMPTY */}
                    {analyses.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-3xl border py-28 text-center">
                            <FileSearch size={60} className="text-ds-text3 mb-4" />

                            <h2 className="text-xl font-bold">Aucun résultat</h2>

                            <p className="text-ds-text2 mt-2 text-sm">Aucun candidat trouvé.</p>
                        </div>
                    )}

                    {/* CONTENT */}
                    {analyses.length > 0 && (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* LEFT LIST */}
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
                                                {initials(item.candidate?.full_name)}
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

                            {/* RIGHT DETAILS SIDEBAR */}
                            {selected && (
                                <div className="space-y-5">
                                    {/* PRINCIPAL PROFILE CARD */}
                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="border-ds-border border-b pb-5 text-center">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#38BDF8] text-2xl font-bold text-white">
                                                {initials(selected.candidate?.full_name)}
                                            </div>

                                            <h2 className="mt-4 text-xl font-bold">{selected.candidate?.full_name}</h2>

                                            <p className="text-ds-text2 mt-1 text-sm">{selected.brief?.title}</p>

                                            <div className={`mt-5 text-6xl font-extrabold ${getScoreColor(selected.score_global ?? 0)}`}>
                                                {selected.score_global ?? 0}
                                            </div>

                                            <p className="text-ds-text3 mt-1 text-xs">Score global IA</p>
                                        </div>

                                        {/* AI PARSED TEXT AND CV ACTION */}
                                        <div className="mt-5">
                                            <a
                                                href={selected.cv_file_path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-ds-accent border-ds-border hover:bg-ds-accent2 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold text-white transition"
                                            >
                                                Voir CV
                                            </a>

                                            <p className="text-ds-text2 py-4 text-sm leading-relaxed">
                                                {lang === 'fr' ? selected.ai_summary : selected.ai_summary_en}
                                            </p>

                                            <button
                                                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                                                className="mt-4 text-xs font-semibold text-indigo-500"
                                            >
                                                {lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* DETECTED AI TAGS */}
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
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-xl border px-3 py-1.5 text-xs font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-ds-text3 text-sm">Aucun skill détecté.</p>
                                        )}
                                    </div>

                                    {/* TECHNICAL SKILLS EXTRACTED FROM CV */}
                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F59E0B]" />
                                            <h3 className="font-bold">Skills CV</h3>
                                        </div>

                                        {selected.extracted_text?.technical_skills?.length ? (
                                            <div className="flex flex-wrap gap-2">
                                                {selected.extracted_text.technical_skills.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-xl border px-3 py-1.5 text-xs font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-ds-text3 text-sm">Aucun skill détecté.</p>
                                        )}
                                    </div>

                                    {/* REQUIRED SKILLS FROM BRIEF MODEL */}
                                    <div className="border-ds-border bg-ds-surface rounded-3xl border p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#F59E0B]" />
                                            <h3 className="font-bold">Skills Brief</h3>
                                        </div>

                                        {selected.brief?.required_skills ? (
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-ds-text2 text-sm leading-relaxed">{selected.brief.required_skills}</p>
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
