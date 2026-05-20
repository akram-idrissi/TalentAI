import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Award, Download, Phone, RotateCcw, Search,ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import ReactSelect from 'react-select';
import { useI18n } from '@/hooks/useI18n';

interface Brief {
    id: number;
    title: string;
}

interface ScoreBreakdown {
    experience?: number;
    education?: number;
    sector?: number;
    soft_skills?: number;
    location?: number;
    required_skills?: number;
    [key: string]: number | undefined;
}

interface Candidate {
    id: number;
    name: string;
    role: string | null;
    company: string | null;
    location: string | null;
    experience_years: number | null;
    linkedin_url: string | null;
    skills: string[];
    summary: string | null;
    score: number;
    score_breakdown: ScoreBreakdown | null;
}

interface Props {
    briefs: Brief[];
    selectedBriefId: number | null;
    candidates: Candidate[];
    filters?: { field: string; value: string }[] | null;
}

const BREAKDOWN_META: Record<string, { label: string; bar: string; text: string }> = {
    experience: { label: 'Expérience', bar: 'bg-[#34D399]', text: 'text-[#34D399]' },
    education: { label: 'Formation', bar: 'bg-[#818CF8]', text: 'text-[#818CF8]' },
    sector: { label: 'Secteur', bar: 'bg-[#22D3EE]', text: 'text-[#22D3EE]' },
    soft_skills: { label: 'Leadership', bar: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' },
    location: { label: 'Localisation', bar: 'bg-ds-text3', text: 'text-ds-text2' },
    required_skills: { label: 'Compétences', bar: 'bg-[#F87171]', text: 'text-[#F87171]' },
};

const AVATAR_GRADIENTS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#22D3EE] to-[#34D399]',
    'from-[#F59E0B] to-[#F87171]',
    'from-[#EC4899] to-[#818CF8]',
    'from-[#38BDF8] to-[#6C63FF]',
    'from-[#34D399] to-[#22D3EE]',
];

const RANK_COLORS = ['text-[#34D399]', 'text-[#818CF8]', 'text-[#22D3EE]'];

function rankColor(index: number) {
    return RANK_COLORS[index] ?? 'text-ds-text3';
}

function initials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

const SUMMARY_LIMIT = 120;

export default function ClassementIndex({ briefs, selectedBriefId, candidates,filters }: Props) {

    const [selected, setSelected] = useState<Candidate | null>(candidates[0] ?? null);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const [expanded, setExpanded] = useState(false);
        const { t } = useI18n();

    const currentBrief = briefs.find((b) => b.id === selectedBriefId) ?? null;
       const [filterModalOpen, setFilterModalOpen] = useState(false);
        const [selectedField, setSelectedField] = useState<string | null>(null);
        const [filterValue, setFilterValue] = useState<any>('');
        const [activeFilters, setActiveFilters] = useState<{ field: string; value: string }[]>(
            Array.isArray(filters) ? filters : []
        );
        const FILTER_FIELDS = [
                    { key: 'full_name', label: 'Nom complet', type: 'text' },
                    { key: 'score', label: 'Score', type: 'number' },
                    { key: 'skills', label: 'Compétences', type: 'text' },
                    {
                        key: 'brief',
                        label: 'Titre du brief',
                        type: 'select',
                        options: [
                            ...briefs.map((b: any) => ({ value: b.id, label: b.title })),
                        ],
                    },
                ];


            function handleSearch() {
            const cleanFilters = activeFilters
                .filter((f) => f.value && String(f.value).trim() !== '')
                .map((f) => ({
                    field: f.field,

                    value: f.value,

                }));
    

 
                
                router.get(
                    route('dashboard.classement'),
                    {
                        brief_id: cleanFilters.find((f) => f.field === 'brief')?.value || selectedBriefId,
                        filters: JSON.stringify(cleanFilters),
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                    }
                );
        }
        console.log(activeFilters);
    
    
        function addFilter(field: string) {
            setActiveFilters((prev) => {
                if (prev.some((f) => f.field === field)) return prev;
                return [...prev, { field, value: '' }];
            });
        }
    
        function removeFilter(field: string) {
            setActiveFilters((prev) => prev.filter((f) => f.field !== field));
        }
    

    function handleBriefChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const id = Number(e.target.value);
        if (!id) return;
        router.get(route('dashboard.classement'), { brief_id: id }, { preserveScroll: true });
    }

    function handleSelect(c: Candidate) {
        setSelected(c);
        setExpanded(false);
    }

    const breakdown = selected?.score_breakdown ? Object.entries(selected.score_breakdown).filter(([, v]) => v !== undefined && v !== null) : [];

    const selectedIndex = candidates.findIndex((c) => c.id === selected?.id);

    const summary =
        selected?.summary ??
        'Profil solide avec une expérience pertinente pour ce poste. Les compétences techniques et le parcours correspondent aux exigences du brief. Candidat recommandé pour un entretien.';

    const isTruncatable = summary.length > SUMMARY_LIMIT;
    const displayedSummary = !expanded && isTruncatable ? summary.slice(0, SUMMARY_LIMIT).trimEnd() + '…' : summary;

    return (
        <>
            <Head title="Classements IA" />
            <AppLayout>
                <div className="bg-ds-bg text-ds-text min-h-screen p-6">
                    {/* HEADER */}
                    <div className="mb-5">
                        <p className="text-ds-text3 text-xs">Candidats &rsaquo; Classement IA</p>

                        <h1 className="text-ds-text mt-1 text-3xl font-bold">
                            {currentBrief ? `Classement IA · ${currentBrief.title}` : 'Classements IA'}
                        </h1>

                        {candidates.length > 0 && (
                            <p className="text-ds-text2 mt-1.5 text-sm">
                                {candidates.length} candidat{candidates.length > 1 ? 's' : ''} analysé
                                {candidates.length > 1 ? 's' : ''} · Triés par score de correspondance global
                            </p>
                        )}
                        
                   {/* FILTERS */}
                            <div className="mb-5 flex flex-wrap items-center py-3 gap-3">
                        {/* Search */}
                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="bg-ds-accent flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#7C74FF]"
                        >
                            <Search size={14} />
                            {t('briefs.index.actions.search')}
                        </button>

                        <button
                            onClick={() => {
                                setSelectedField(null);
                                setFilterValue('');
                                router.get(route('dashboard.classement'));
                            }}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px]"
                        >
                            <RotateCcw size={13} />
                           {t('briefs.index.actions.reset')}
                        </button>

                    </div>

                    {filterModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            
                            <div className="w-full max-w-2xl rounded-2xl border border-ds-border bg-ds-surface shadow-2xl">
                                
                                {/* HEADER */}
                                <div className="flex items-center justify-between border-b border-ds-border px-6 py-4">
                                    
                                    <div>
                                        <h2 className="font-heading text-[18px] font-bold text-ds-text">
                                            Filtres avancés    
                                        </h2>

                                        <p className="mt-1 text-[13px] text-ds-text3">
                                            Sélectionnez les filtres à afficher
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setFilterModalOpen(false)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ds-border bg-ds-bg3 text-ds-text2 transition hover:border-ds-border2 hover:bg-ds-bg2 hover:text-ds-text"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* CONTENT */}
                                <div className="custom-scroll max-h-[420px] overflow-y-auto p-6">

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                        {FILTER_FIELDS.map((f) => {

                                            const isActive = activeFilters.some(
                                                (item) => item.field === f.key
                                            );

                                            return (
                                                <button
                                                    key={f.key}
                                                    onClick={() => addFilter(f.key)}
                                                    className={`
                                                        group relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-all duration-200
                                                        
                                                        ${
                                                            isActive
                                                                ? 'border-ds-accent bg-ds-accent text-white shadow-lg shadow-ds-accent/20'
                                                                : 'border-ds-border bg-ds-bg2 text-ds-text hover:border-ds-accent/40 hover:bg-ds-bg3'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        
                                                        <span className="text-[13px] font-medium">
                                                            {f.label}
                                                        </span>

                                                        {isActive && (
                                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="flex items-center justify-between border-t border-ds-border px-6 py-4">
                                    
                                    <p className="text-[12px] text-ds-text3">
                                        {activeFilters.length} filtre(s) sélectionné(s)
                                    </p>

                                    <div className="flex items-center gap-3">

                                        <button
                                            onClick={() => {setActiveFilters([]),setFilterModalOpen(false)}}
                                            className="rounded-lg border border-ds-border bg-ds-bg3 px-4 py-2 text-[13px] font-medium text-ds-text2 transition hover:bg-ds-bg2 hover:text-ds-text"
                                        >
                                            {t('briefs.index.actions.reset')}
                                        </button>

                                        <button
                                            onClick={() => setFilterModalOpen(false)}
                                            className="rounded-lg bg-ds-accent px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                                        >
                                            Appliquer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeFilters.length > 0 && (
                        <div className="mb-5 rounded-2xl border border-ds-border bg-ds-surface p-5">

                           
                            {/* HEADER */}
                            <div className="mb-5 flex items-center justify-between">

                                <div>
                                    <h3 className="text-sm font-semibold text-ds-text">
                                        Filtres actifs
                                    </h3>

                                    <p className="mt-1 text-xs text-ds-text3">
                                        Configurez vos filtres de recherche
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveFilters([])}
                                        className="
                                            rounded-lg border border-ds-border
                                            bg-ds-bg3 px-3 py-2 text-xs
                                            text-ds-text2 transition
                                            hover:bg-ds-bg2
                                            hover:text-ds-text
                                        "
                                    >
                                        {t('briefs.index.actions.reset')}
                                    </button>
                                    <button
                                        onClick={() => setFiltersOpen(!filtersOpen)}
                                        className="
                                            flex items-center gap-1 rounded-lg
                                            border border-ds-border bg-ds-bg3
                                            px-3 py-2 text-xs text-ds-text2
                                            transition hover:bg-ds-bg2 hover:text-ds-text
                                        "
                                    >
                                        {filtersOpen ? (
                                            <>
                                                
                                                <ChevronUp size={14} />
                                            </>
                                        ) : (
                                            <>
                                                
                                                <ChevronDown size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {filtersOpen && (
                                <>
                            {/* GRID */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                                {activeFilters.map((f, index) => {

                                    const field = FILTER_FIELDS.find(
                                        (x) => x.key === f.field
                                    );

                                    if (!field) return null;

                                    return (
                                        <div
                                            key={f.field}
                                            className="
                                                rounded-xl border border-ds-border
                                                bg-ds-bg2 p-3
                                            "
                                        >

                                            {/* TOP */}
                                            <div className="mb-3 flex items-center justify-between">

                                                <p className="text-xs font-semibold text-ds-text">
                                                    {field.label}
                                                </p>

                                                <button
                                                    onClick={() => removeFilter(f.field)}
                                                    className="
                                                        flex h-6 w-6 items-center justify-center
                                                        rounded-md text-ds-text3 transition

                                                        hover:bg-red-500/10
                                                        hover:text-red-400
                                                    "
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* FIELD */}
                                            {field.type === 'select' ? (

                                                <ReactSelect
                                                    classNamePrefix="rs"
                                                    options={field.options}
                                                    value={
                                                        field.options?.find(
                                                            (opt: any) =>
                                                                opt.value === f.value
                                                        ) ?? null
                                                    }
                                                    onChange={(opt: any) => {

                                                        const newFilters = [...activeFilters];

                                                        newFilters[index].value =
                                                            opt?.value ?? '';

                                                        setActiveFilters(newFilters);
                                                    }}
                                                    placeholder="Sélectionner..."
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: 'var(--ds-bg3)',
                                                            borderColor: state.isFocused
                                                                ? '#6C63FF'
                                                                : 'var(--ds-border)',
                                                            minHeight: '42px',
                                                            boxShadow: 'none',
                                                            borderRadius: '10px',
                                                            fontSize: '13px',
                                                            cursor: 'pointer',
                                                        }),

                                                        menu: (base) => ({
                                                            ...base,
                                                            backgroundColor: 'var(--ds-surface)',
                                                            border: '1px solid var(--ds-border)',
                                                            overflow: 'hidden',
                                                            zIndex: 30,
                                                        }),

                                                        singleValue: (base) => ({
                                                            ...base,
                                                            color: 'var(--ds-text)',
                                                        }),

                                                        input: (base) => ({
                                                            ...base,
                                                            color: 'var(--ds-text)',
                                                        }),

                                                        placeholder: (base) => ({
                                                            ...base,
                                                            color: 'var(--ds-text3)',
                                                        }),

                                                        option: (base, state) => ({
                                                            ...base,
                                                            backgroundColor: state.isFocused
                                                                ? 'rgba(108,99,255,0.15)'
                                                                : 'transparent',
                                                            color: 'var(--ds-text)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                        }),
                                                    }}
                                                />

                                            ) : (

                                                <input
                                                    type={field.type}
                                                    value={f.value}
                                                    onChange={(e) => {

                                                        const newFilters = [...activeFilters];

                                                        newFilters[index].value =
                                                            e.target.value;

                                                        setActiveFilters(newFilters);
                                                    }}
                                                    placeholder={field.label}
                                                    className="
                                                        w-full rounded-xl border border-ds-border
                                                        bg-ds-bg3 px-3 py-2.5 text-[13px]
                                                        text-ds-text placeholder:text-ds-text3
                                                        outline-none transition

                                                        focus:border-ds-accent
                                                    "
                                                />
                                            )}
                                        </div>
                                    );
                                
                                })}
                            </div>

                            {/* ACTIONS */}
                            <div className="mt-5 flex justify-end">

                                <button
                                    onClick={handleSearch}
                                    className="
                                        bg-ds-accent rounded-xl px-5 py-2.5
                                        text-[13px] font-semibold text-white
                                        transition hover:opacity-90
                                    "
                                >
                                    Rechercher
                                </button>
                            </div>
                            </>
                            )}  
                        </div>
                    )}
                    </div>

                    {/* EMPTY STATE */}
                    {candidates.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <Award size={52} className="text-ds-text3 mb-4" />
                            <h2 className="text-ds-text text-lg font-semibold">Aucun candidat classé</h2>
                            <p className="text-ds-text2 mt-1 max-w-xs text-sm">
                                {currentBrief
                                    ? "Lancez un sourcing pour ce brief afin d'obtenir un classement IA."
                                    : 'Sélectionnez un brief pour voir le classement IA des candidats.'}
                            </p>
                        </div>
                    )}

                    {candidates.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                            {/* ── CANDIDATE LIST ── */}
                            <div className="space-y-3 lg:col-span-2">
                                {candidates.map((c, index) => (
                                    <div
                                        key={c.id}
                                        onClick={() => handleSelect(c)}
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-150 ${
                                            selected?.id === c.id
                                                ? 'border-[#6C63FF]/60 bg-[#6C63FF]/10 shadow-[0_0_0_1px_rgba(108,99,255,0.3)]'
                                                : 'border-ds-border bg-ds-surface hover:border-ds-border2 hover:bg-ds-bg3'
                                        }`}
                                    >
                                        {/* rank badge */}
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                                                index === 0
                                                    ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                                                    : index === 1
                                                      ? 'text-ds-text2 bg-white/8'
                                                      : index === 2
                                                        ? 'bg-[#cd7f32]/15 text-[#cd7f32]'
                                                        : 'bg-ds-bg3 text-ds-text3'
                                            }`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* avatar */}
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                                                AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                                            }`}
                                        >
                                            {initials(c.name)}
                                        </div>

                                        {/* info */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-ds-text text-[15px] font-semibold">{c.name}</p>
                                            <p className="text-ds-text2 mt-0.5 text-xs">
                                                {[c.role, c.company, c.experience_years ? `${c.experience_years} ans` : null]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                            {c.skills.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {c.skills.slice(0, 4).map((s) => (
                                                        <span
                                                            key={s}
                                                            className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-md border px-2 py-0.5 text-[11px]"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* score */}
                                        <div className="shrink-0 text-right">
                                            <span
                                                className={`text-xl leading-none font-bold ${rankColor(index)}`}
                                                style={{ fontFamily: 'var(--font-heading)' }}
                                            >
                                                {c.score}
                                            </span>
                                            <p className="text-ds-text3 mt-0.5 text-[11px]">/100</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ── DETAIL PANEL ── */}
                            {selected && (
                                <div className="flex flex-col gap-4">
                                    {/* Card 1: score + breakdown + actions */}
                                    <div className="border-ds-border bg-ds-surface rounded-2xl border p-5">
                                        <div className="border-ds-border border-b pb-4 text-center">
                                            <div
                                                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white ${
                                                    AVATAR_GRADIENTS[selectedIndex % AVATAR_GRADIENTS.length]
                                                }`}
                                            >
                                                {initials(selected.name)}
                                            </div>

                                            <h2 className="text-ds-text mt-2.5 text-base font-bold">{selected.name}</h2>

                                            <p className="text-ds-text2 mt-0.5 text-center text-xs">
                                                {[selected.role, selected.company].filter(Boolean).join(' · ')}
                                            </p>

                                            <div className="mt-2.5 flex justify-center gap-2">
                                                {selected.linkedin_url && (
                                                    <a
                                                        href={selected.linkedin_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded-full border border-[#5b9bd5]/40 bg-[#5b9bd5]/15 px-3 py-1 text-xs font-medium text-[#5b9bd5]"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {selectedIndex === 0 && (
                                                    <span className="rounded-full border border-[#34D399]/40 bg-[#34D399]/20 px-3 py-1 text-xs font-semibold text-[#34D399]">
                                                        Top match
                                                    </span>
                                                )}
                                            </div>

                                            <p
                                                className={`mt-3 leading-none font-extrabold ${rankColor(selectedIndex)}`}
                                                style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem' }}
                                            >
                                                {selected.score}
                                            </p>
                                            <p className="text-ds-text3 mt-1 text-xs">/100 · Score IA global</p>
                                        </div>

                                        {/* breakdown bars */}
                                        {breakdown.length > 0 && (
                                            <div className="mt-4 space-y-2.5">
                                                {breakdown.map(([key, value]) => {
                                                    const meta = BREAKDOWN_META[key] ?? {
                                                        label: key,
                                                        bar: 'bg-ds-accent',
                                                        text: 'text-ds-accent',
                                                    };
                                                    return (
                                                        <div key={key} className="flex items-center gap-3">
                                                            <span className="text-ds-text2 w-24 shrink-0 text-xs">{meta.label}</span>
                                                            <div className="bg-ds-bg3 h-2 flex-1 overflow-hidden rounded-full">
                                                                <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${value}%` }} />
                                                            </div>
                                                            <span className={`w-8 shrink-0 text-right text-sm font-bold ${meta.text}`}>{value}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Card 2: Analyse IA */}
                                    <div className="border-ds-border bg-ds-surface rounded-2xl border p-6">
                                        <h3 className="text-ds-text text-base font-bold">Analyse IA</h3>
                                        <p className="text-ds-text2 mt-2 text-sm leading-relaxed">{displayedSummary}</p>
                                        {isTruncatable && (
                                            <button
                                                onClick={() => setExpanded((v) => !v)}
                                                className="text-ds-accent mt-1.5 text-xs font-medium hover:underline"
                                            >
                                                {expanded ? 'Réduire' : 'Lire plus'}
                                            </button>
                                        )}
                                        {selected.skills.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-1.5">
                                                {selected.skills.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="border-ds-border bg-ds-bg3 text-ds-text2 rounded-md border px-2.5 py-1 text-xs"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* actions — standalone below Analyse IA */}
                                    <button className="bg-ds-accent flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                                        <Phone size={14} />
                                        Planifier entretien
                                    </button>
                                    <button className="border-ds-border text-ds-text2 hover:bg-ds-bg3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition">
                                        <Download size={14} />
                                        Télécharger fiche
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
