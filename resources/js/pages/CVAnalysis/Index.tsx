import AppLayout from "@/layouts/app-layout";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Brain,
    Briefcase,
    ChevronRight,
    FileSearch,
    MapPin,
    Plus,
    RotateCcw,
    Search,
    Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactSelect from 'react-select';

const SCORE_COLORS = [
    "from-[#6C63FF] to-[#8B5CF6]",
    "from-[#38BDF8] to-[#0EA5E9]",
    "from-[#34D399] to-[#10B981]",
    "from-[#F59E0B] to-[#F97316]",
    "from-[#F87171] to-[#EF4444]",
];

function getScoreColor(score: number) {
    if (score >= 80) return "text-[#34D399]";
    if (score >= 60) return "text-[#F59E0B]";
    return "text-[#F87171]";
}

function initials(name: string) {
    return name
        ?.split(" ")
        ?.slice(0, 2)
        ?.map((w: string) => w[0])
        ?.join("")
        ?.toUpperCase();
}

export default function Index() {
    const { analyses, briefs, filters } = usePage().props as any;

    const [selected, setSelected] = useState<any>(
        analyses?.[0] ?? null
    );

    const [lang, setLang] = useState("fr");
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [filterValue, setFilterValue] = useState<any>('');
     const [activeFilters, setActiveFilters] = useState<{ field: string; value: string }[]>([]);
      const FILTER_FIELDS = [
            { key: 'full_name', label: 'Nom complet', type: 'text' },
            { key: 'score', label: 'Score', type: 'number' },
            { key: 'extracted_text.technical_skills', label: 'Compétences', type: 'text' },
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
            .filter((f) => f.value && f.value && String(f.value).trim() !== '')
            .map((f) => ({
                field: f.field,
                value: f.value,
            }));

            router.get(route('dashboard.cv-analysis.index'), {
                filters: JSON.stringify(cleanFilters),
                    preserveState: true,
                    preserveScroll: true,

            });
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

                <div className="min-h-screen bg-ds-bg p-6 text-ds-text">

                    {/* HEADER */}
                    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <p className="text-ds-text3 text-xs">
                                Recruitment › CV Analysis
                            </p>

                            <h1 className="mt-1 text-3xl font-bold">
                                Analyses CV IA
                            </h1>

                            <p className="text-ds-text2 mt-1 text-sm">
                                Analyse intelligente des candidats.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                router.get(
                                    route("dashboard.cv-analysis.create")
                                )
                            }
                            className="flex items-center gap-2 rounded-2xl bg-[#6C63FF] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            <Plus size={16} />
                            Nouvelle Analyse
                        </button>

                    </div>

                    {/* FILTERS */}
                            <div className="mb-5 flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="bg-ds-accent flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#7C74FF]"
                        >
                            <Search size={14} />
                            Définir les filtres
                        </button>
                        <button
                            onClick={() => {
                                setSelectedField(null);
                                setFilterValue('');
                                router.get(route('dashboard.cv-analysis.index'));
                            }}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px]"
                        >
                            <RotateCcw size={13} />
                            Reset
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
                                            Reset
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
                                    Reset
                                </button>
                            </div>

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
                        </div>
                    )}

                    {/* EMPTY */}
                    {(!analyses || analyses.length === 0) && (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-ds-border bg-ds-surface py-28 text-center">

                            <FileSearch
                                size={60}
                                className="mb-4 text-ds-text3"
                            />

                            <h2 className="text-xl font-bold">
                                Aucun résultat
                            </h2>

                            <p className="text-ds-text2 mt-2 text-sm">
                                Aucun candidat trouvé.
                            </p>

                        </div>
                    )}

                    {/* CONTENT */}
                    {analyses?.length > 0 && (

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                            {/* LEFT */}
                            <div className="space-y-4 lg:col-span-2">

                                {analyses.map((item: any, index: number) => (

                                    <div
                                        key={item.id}
                                        onClick={() => setSelected(item)}
                                        className={`cursor-pointer rounded-3xl border p-5 transition-all duration-200 ${
                                            selected?.id === item.id
                                                ? "border-[#6C63FF]/50 bg-[#6C63FF]/10 shadow-[0_0_0_1px_rgba(108,99,255,0.3)]"
                                                : "border-ds-border bg-ds-surface hover:border-ds-border2 hover:bg-ds-bg3"
                                        }`}
                                    >

                                        <div className="flex items-start gap-4">

                                            {/* AVATAR */}
                                            <div
                                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white ${
                                                    SCORE_COLORS[
                                                        index %
                                                        SCORE_COLORS.length
                                                    ]
                                                }`}
                                            >
                                                {initials(
                                                    item.candidate?.full_name ??
                                                    "U"
                                                )}
                                            </div>

                                            {/* INFO */}
                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div>

                                                        <h2 className="truncate text-lg font-bold">
                                                            {item.candidate?.full_name}
                                                        </h2>

                                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ds-text2">

                                                            <div className="flex items-center gap-1">
                                                                <Briefcase size={13} />
                                                                {item.brief?.title}
                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* SCORE */}
                                                    <div className="text-right">

                                                        <p
                                                            className={`text-3xl font-extrabold ${getScoreColor(
                                                                item.score_global ?? 0
                                                            )}`}
                                                        >
                                                            {item.score_global ?? 0}
                                                        </p>

                                                        <p className="text-ds-text3 text-xs">
                                                            /100
                                                        </p>

                                                    </div>
                                                    

                                                </div>

                                                {/* SUMMARY */}
                                                {item.ai_summary && (
                                                    <p className="text-ds-text2 mt-4 line-clamp-2 text-sm leading-relaxed">
                                                        {item.ai_summary}
                                                    </p>
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
                                    <div className="rounded-3xl border border-ds-border bg-ds-surface p-6">

                                        <div className="border-ds-border border-b pb-5 text-center">

                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#38BDF8] text-2xl font-bold text-white">

                                                {initials(
                                                    selected.candidate?.full_name
                                                )}

                                            </div>

                                            <h2 className="mt-4 text-xl font-bold">
                                                {selected.candidate?.full_name}
                                            </h2>

                                            <p className="text-ds-text2 mt-1 text-sm">
                                                {selected.brief?.title}
                                            </p>

                                            <div
                                                className={`mt-5 text-6xl font-extrabold ${getScoreColor(
                                                    selected.score_global ?? 0
                                                )}`}
                                            >
                                                {selected.score_global ?? 0}
                                            </div>

                                            <p className="text-ds-text3 mt-1 text-xs">
                                                Score global IA
                                            </p>

                                        </div>

                                        {/* ANALYSIS */}
                                        <div className="mt-5">

                                            <div className="mb-3 flex items-center gap-2">
                                                <Brain
                                                    size={18}
                                                    className="text-[#6C63FF]"
                                                />

                                                <h3 className="font-bold">
                                                    Analyse IA
                                                </h3>
                                            </div>
                                            <a
                                                    href={`${selected.cv_file_path}`}
                                                    target="_blank"
                                                    className="flex w-full bg-ds-accent items-center justify-center gap-2 rounded-2xl border border-ds-border py-3 text-sm font-semibold transition hover:bg-ds-accent2 text-white"
                                                >
                                                    Voir CV
                                                </a>

                                            <p className=" py-4 text-ds-text2 text-sm leading-relaxed">
                                                    {lang === "fr"
                                                        ? selected.ai_summary
                                                        : selected.ai_summary_en}
                                            </p>
                                                    <button
                                                        onClick={() =>
                                                            setLang(
                                                                lang === "fr"
                                                                    ? "en"
                                                                    : "fr"
                                                            )
                                                        }
                                                        className="mt-4 text-xs text-indigo-500"
                                                    >
                                                        {lang === "fr"
                                                            ? "Switch to English"
                                                            : "Passer en Français"}
                                                    </button>
                                        </div>

                                    </div>

                                    {/* TAGS */}
                                    <div className="rounded-3xl border border-ds-border bg-ds-surface p-6">

                                        <div className="mb-4 flex items-center gap-2">

                                            <Sparkles
                                                size={18}
                                                className="text-[#F59E0B]"
                                            />

                                            <h3 className="font-bold">
                                                Skills détectés
                                            </h3>

                                        </div>

                                        {parsedTags.length > 0 ? (

                                            <div className="flex flex-wrap gap-2">

                                                {parsedTags.map(
                                                    (
                                                        tag: string,
                                                        index: number
                                                    ) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-xl border border-ds-border bg-ds-bg3 px-3 py-1.5 text-xs text-ds-text2"
                                                        >
                                                            {tag}
                                                        </span>
                                                    )
                                                )}

                                            </div>

                                        ) : (

                                            <p className="text-ds-text3 text-sm">
                                                Aucun skill détecté.
                                            </p>

                                        )}

                                    </div>

                                    <div className="rounded-3xl border border-ds-border bg-ds-surface p-6">

                                        <div className="mb-4 flex items-center gap-2">

                                            <Sparkles
                                                size={18}
                                                className="text-[#F59E0B]"
                                            />

                                            <h3 className="font-bold">
                                                Skills CV
                                            </h3>

                                        </div>

                                        {selected?.extracted_text?.technical_skills?.length > 0? (

                                            <div className="flex flex-wrap gap-2">

                                                {selected.extracted_text.technical_skills.map(
                                                    (
                                                        tag: string,
                                                        index: number
                                                    ) => (
                                                        <span
                                                            key={index}
                                                            className="rounded-xl border border-ds-border bg-ds-bg3 px-3 py-1.5 text-xs text-ds-text2"
                                                        >
                                                            {tag}
                                                        </span>
                                                    )
                                                )}

                                            </div>

                                        ) : (

                                            <p className="text-ds-text3 text-sm">
                                                Aucun skill détecté.
                                            </p>

                                        )}

                                    </div>

                                    <div className="rounded-3xl border border-ds-border bg-ds-surface p-6">

                                        <div className="mb-4 flex items-center gap-2">

                                            <Sparkles
                                                size={18}
                                                className="text-[#F59E0B]"
                                            />

                                            <h3 className="font-bold">
                                                Skills Brif
                                            </h3>

                                        </div>

                                        {selected?.brief?.required_skills?.length > 0? (

                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-ds-text2">
                                                    {selected.brief.required_skills}
                                                </p>
                                            </div>

                                        ) : (

                                            <p className="text-ds-text3 text-sm">
                                                Aucun skill détecté.
                                            </p>

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