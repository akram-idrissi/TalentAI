import DataTable from '@/components/briefs/DataTable';
import DeleteModal from '@/components/ui/DeleteModal';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import type { Brief, IndexBriefProps } from '@/types/brief';
import { Head, Link, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Edit2, Eye, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

// ── Source badge ────────────────────────────────────────────
function ContractBadge({ type }: { type: string }) {
    return (
        <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold">
            {type}
        </span>
    );
}

export default function Index({ briefs, filters }: IndexBriefProps) {
    const { t } = useI18n();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deletingBrief, setDeletingBrief] = useState<Brief | null>(null);

    function handleDelete() {
        if (!deletingBrief) return;
        router.delete(route('briefs.destroy', deletingBrief.id), { onSuccess: () => setDeletingBrief(null) });
    }

    function handleSearch() {
        router.get(route('dashboard.briefs.index'), { search }, { preserveState: true });
    }

    function handleReset() {
        setSearch('');
        router.get(route('dashboard.briefs.index'));
    }

      const columns = [
    {
      header: "POSTE VISÉ",
      render: (brief: any, index: number) => (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#38BDF8] text-[11px] font-bold text-white">
            {brief.title.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-heading text-ds-text truncate font-semibold">
              {brief.title}
            </p>
            <p className="text-ds-text3 truncate text-[11px]">
              {brief.location} · {brief.min_experience_years} ans exp.
            </p>
          </div>
        </div>
      ),
    },

    {
      header: "SECTEUR",
      render: (brief: any) => brief.sector,
    },

    {
      header: "CONTRAT",
      render: (brief: any) => (
        <span className="bg-ds-accent/10 text-ds-accent2 border-ds-accent/20 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
          {brief.contract_type}
        </span>
      ),
    },

    {
      header: "EXPÉRIENCE",
      render: (brief: any) => `${brief.min_experience_years} ans`,
    },

    {
      header: "LOCALISATION",
      render: (brief: any) => brief.location,
    },

    {
      header: "STATUT",
      render: (brief: any) => {
        const map: any = {
          active: "bg-green-500/10 text-green-400 border-green-400/20",
          draft: "bg-indigo-500/10 text-indigo-400 border-indigo-400/20",
          sourcing: "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
        };

        return (
          <span className={`border rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[brief.status]}`}>
            {brief.status}
          </span>
        );
      },
    },

    {
      header: "CRÉÉ",
      render: (brief: any) => (
        <span className="text-ds-text3 text-[12px]">
          {dayjs(brief.created_at).fromNow()}
        </span>
      ),
    },

    {
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      render: (brief: any) => (
        <div className="flex items-center justify-end gap-1">
          
          <button 
            onClick={() => router.get(route('dashboard.briefs.show', brief.id))}
            className="border-ds-border text-ds-text3 hover:text-blue-500 flex h-7 w-7 items-center justify-center rounded-lg border">
            <Eye size={13} />
          </button>

          <button
            onClick={() => router.get(route('dashboard.briefs.edit', brief.id))}
            className="border-ds-border text-ds-text3 hover:text-yellow-400 flex h-7 w-7 items-center justify-center rounded-lg border">
            <Edit2 size={13} />
          </button>

          <button
            onClick={() => setDeletingBrief(brief)}
            className="border-ds-border text-ds-text3 hover:text-red-400 flex h-7 w-7 items-center justify-center rounded-lg border"
          >
            <Trash2 size={13} />
          </button>

        </div>
      ),
    },
  ];

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
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={14} className="text-ds-text3 absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('briefs.index.search_placeholder')}
                                className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSearch}
                                className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#7C74FF]"
                            >
                                {t('briefs.index.actions.search')}
                            </button>
                            <button
                                onClick={handleReset}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] transition"
                            >
                                <RotateCcw size={13} />
                                {t('briefs.index.actions.reset')}
                            </button>
                            <Link
                                href={route('dashboard.briefs.create')}
                                className="bg-ds-accent flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                            >
                                <Plus size={14} />
                                {t('briefs.index.actions.create')}
                            </Link>
                        </div>
                    </div>

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
                                <DataTable
                                    data={briefs.data}
                                    columns={columns}
                                    />
                            </div>
                        </div>
                    )}
                </div>

                {deletingBrief && <DeleteModal brief={deletingBrief} onConfirm={handleDelete} onCancel={() => setDeletingBrief(null)} />}
            </AppLayout>
        </>
    );
}
