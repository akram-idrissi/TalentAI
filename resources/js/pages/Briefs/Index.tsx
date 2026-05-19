import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Brief, IndexBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChevronLeft, ChevronRight, Edit2, Eye, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ReactSelect from 'react-select';

dayjs.extend(relativeTime);
dayjs.locale('fr');

// ── Status badge ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    active: { label: 'Actif', className: 'bg-badge-active-bg text-badge-active-text border border-badge-active-text/20' },
    draft: { label: 'Brouillon', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    sourcing: { label: 'En sourcing', className: 'bg-badge-sourcing-bg text-badge-sourcing-text border border-badge-sourcing-text/20' },
    interview: { label: 'Entretiens', className: 'bg-badge-interview-bg text-badge-interview-text border border-badge-interview-text/20' },
};

function BriefStatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-ds-bg3 text-ds-text2 border border-ds-border' };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

// ── Avatar initials ─────────────────────────────────────────
const AVATAR_COLORS = [
    'from-[#6C63FF] to-[#38BDF8]',
    'from-[#34D399] to-[#38BDF8]',
    'from-[#FBBF24] to-[#F87171]',
    'from-[#A78BFA] to-[#6C63FF]',
    'from-[#F87171] to-[#FBBF24]',
];

function BriefAvatar({ title, index }: { title: string; index: number }) {
    const initials = title
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    return (
        <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} text-[11px] font-bold text-white`}
        >
            {initials}
        </div>
    );
}

// ── Contract badge ──────────────────────────────────────────
function ContractBadge({ type }: { type: string }) {
    return (
        <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
            {type}
        </span>
    );
}

// ── Pagination ──────────────────────────────────────────────
interface PaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

function Pagination({ meta, search }: { meta: PaginationMeta; search: string }) {
    const { current_page, last_page, from, to, total } = meta;

    if (last_page <= 1) return null;

    function goTo(page: number) {
        router.get(route('dashboard.briefs.index'), { page, ...(search ? { search } : {}) }, { preserveState: true, preserveScroll: false });
    }

    const pages = Array.from({ length: last_page }, (_, i) => i + 1);
    const visible = pages.filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);

    const btnBase = 'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition';
    const btnIdle = 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text';
    const btnActive = 'border-ds-accent bg-ds-accent text-white';
    const btnDisabled = 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50';

    return (
        <div className="mt-4 flex items-center justify-between text-[13px]">
            <p className="text-ds-text3">{from != null && to != null ? `${from}–${to} sur ${total} briefs` : `${total} briefs`}</p>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    className={`${btnBase} ${current_page === 1 ? btnDisabled : btnIdle}`}
                    aria-label="Page précédente"
                >
                    <ChevronLeft size={13} />
                </button>

                {visible.map((p, i) => (
                    <span key={p} className="flex items-center gap-1">
                        {i > 0 && visible[i - 1] !== p - 1 && <span className="text-ds-text3 px-0.5">…</span>}
                        <button
                            onClick={() => goTo(p)}
                            className={`${btnBase} ${p === current_page ? btnActive : btnIdle}`}
                            aria-current={p === current_page ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page === last_page}
                    className={`${btnBase} ${current_page === last_page ? btnDisabled : btnIdle}`}
                    aria-label="Page suivante"
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}

export default function Index({ briefs,filters }: IndexBriefProps) {
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [deletingBrief, setDeletingBrief] = useState<Brief | null>(null);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [filterValue, setFilterValue] = useState<any>('');
    const [status, setStatus] = useState('');
    const [activeFilters, setActiveFilters] = useState<{ field: string; value: string }[]>([]);

    const FILTER_FIELDS = [ { key: 'title', label: 'Poste', type: 'text' }, 
        { key: 'sector', label: 'Secteur', type: 'select', 
            options: [     { value: 'commerce', label: 'Commerce & Vente' },
        { value: 'tech', label: 'Tech & Digital' },
        { value: 'finance', label: 'Finance & Audit' },
        { value: 'rh', label: 'RH & Formation' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'operations', label: 'Opérations & Logistique' },
        { value: 'juridique', label: 'Juridique' },
        { value: 'sante', label: 'Santé' }, ],
        },
        { key: 'contract_type', label: 'Contrat', type: 'select', 
            options: [ { value: 'CDI', label: 'CDI' }, { value: 'CDD', label: 'CDD' }, { value: 'freelance', label: 'Freelance' }, { value: 'stage', label: 'Stage' } ],
        },
            { key: 'location', label: 'Localisation', type: 'text' },
            { key: 'min_experience_years', label: 'Expérience', type: 'number' },
            { key: 'education_level', label: 'Education', type: 'select', 
                options: [     { value: 'bac', label: 'Bac' },
                                { value: 'bac2', label: 'Bac+2' },
                                { value: 'bac3', label: 'Bac+3 (Licence)' },
                                { value: 'bac5', label: 'Bac+5 (Master)' },
                                { value: 'bac5_grande_ecole', label: 'Bac+5 Grande École' },
                                { value: 'doctorat', label: 'Doctorat' }, 
                        ],
            },
                { key: 'status', label: 'Statut', type: 'select', 
                    options: [ { value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }, { value: 'sourcing', label: 'Sourcing' }, { value: 'interviews', label: 'Interviews' }, 
                { value: 'closed', label: 'Closed' }, ]}, ]; 

    function handleDelete() {
        if (!deletingBrief) return;
        router.delete(route('dashboard.briefs.destroy', deletingBrief.id), {
            onSuccess: () => setDeletingBrief(null),
        });
    }

    function handleSearch() {
        const cleanFilters = activeFilters
            .filter((f) => f.value && f.value.trim() !== '')
            .map((f) => ({
                field: f.field,
                value: f.value,
            }));

        router.get(route('dashboard.briefs.index'), {
            filters: JSON.stringify(cleanFilters),
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

    return (
        <>
            <Head title={t('briefs.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('briefs.index.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">{t('briefs.index.subtitle')}</p>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                                setStatus('');
                                router.get(route('dashboard.briefs.index'));
                            }}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px]"
                        >
                            <RotateCcw size={13} />
                            Reset
                        </button>
                                                   
                                <Link
                                    href={route('dashboard.briefs.create')}
                                    className="bg-ds-accent ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                                >
                                    <Plus size={14} />
                                    {t('briefs.index.actions.create')}
                                </Link>
                          
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

                    {/* Empty state */}
                    {briefs.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <span className="text-2xl">📋</span>
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('briefs.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('briefs.index.empty.description')}</p>
                            <Link
                                href={route('dashboard.briefs.create')}
                                className="bg-ds-accent mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('briefs.index.actions.create')}
                            </Link>
                        </div>
                    )}

                    {/* Table */}
                    {briefs.data.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-[13px]">
                                    <thead>
                                        <tr className="border-ds-border border-b">
                                            {['POSTE VISÉ', 'SECTEUR', 'CONTRAT', 'EXPÉRIENCE', 'LOCALISATION', 'STATUT', 'CRÉÉ', ''].map((col) => (
                                                <th
                                                    key={col}
                                                    className="text-ds-text3 px-4 py-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {briefs.data.map((brief, index) => (
                                            <tr
                                                key={brief.id}
                                                className="border-ds-border hover:bg-ds-bg3/40 border-b transition-colors last:border-0"
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <BriefAvatar title={brief.title} index={index} />
                                                        <div className="min-w-0">
                                                            <p className="font-heading text-ds-text truncate font-semibold">{brief.title}</p>
                                                            <p className="text-ds-text3 truncate text-[11px]">
                                                                {brief.location} · {brief.min_experience_years} ans exp.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-ds-text2 px-4 py-3.5">{brief.sector}</td>
                                                <td className="px-4 py-3.5">
                                                    <ContractBadge type={brief.contract_type} />
                                                </td>
                                                <td className="text-ds-text2 px-4 py-3.5">{brief.min_experience_years} ans</td>
                                                <td className="text-ds-text2 px-4 py-3.5">{brief.location}</td>
                                                <td className="px-4 py-3.5">
                                                    <BriefStatusBadge status={brief.status} />
                                                </td>
                                                <td className="text-ds-text3 px-4 py-3.5 text-[12px]">{dayjs(brief.created_at).fromNow()}</td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('dashboard.briefs.show', brief.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('briefs.index.actions.view')}
                                                        >
                                                            <Eye size={13} />
                                                        </Link>
                                                        <Link
                                                            href={route('dashboard.briefs.edit', brief.id)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('briefs.index.actions.edit')}
                                                        >
                                                            <Edit2 size={13} />
                                                        </Link>
                                                        <button
                                                            onClick={() => setDeletingBrief(brief)}
                                                            className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                                                            title={t('briefs.index.actions.delete')}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Pagination ── */}
                            <div className="px-4 pb-4">
                                <Pagination meta={briefs} search={search} />
                            </div>
                        </div>
                    )}
                </div>

                {deletingBrief && (
                    <DeleteModal
                        label={deletingBrief.title}
                        i18nPrefix="briefs.index.modal"
                        onConfirm={handleDelete}
                        onCancel={() => setDeletingBrief(null)}
                    />
                )}
            </AppLayout>
        </>
    );
}

