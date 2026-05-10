
import CandidateTable from '@/components/Candidats/CandidatsTable';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

dayjs.extend(relativeTime);
dayjs.locale('fr');

/* ---------------- TYPES ---------------- */

interface Brief {
    id: number;
    title: string;
}

interface Candidat {
    id: number;
    full_name: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    experience_years?: number;
    status: string;
    score?: number;
    sourced_at?: string;
}

interface PaginationMeta<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    briefs: Brief[];
    candidats: PaginationMeta<Candidat> | null;
    filters: {
        brief_id?: number;
    };
}

/* ---------------- PAGINATION ---------------- */

function Pagination({ meta, brief_id }: { meta: PaginationMeta<Candidat>; brief_id?: number }) {
    if (meta.last_page <= 1) return null;

    function goTo(page: number) {
        router.get(route('dashboard.sourcing.index'), { page, ...(brief_id ? { brief_id } : {}) }, { preserveState: true });
    }

    return (
        <div className="mt-4 flex items-center justify-between text-[13px]">
            <p className="text-ds-text3">{meta.from != null && meta.to != null ? `${meta.from}–${meta.to} sur ${meta.total}` : `${meta.total}`}</p>

            <div className="flex items-center gap-2">
                <button onClick={() => goTo(meta.current_page - 1)} disabled={meta.current_page === 1} className="border-ds-border rounded px-3 py-1">
                    <ChevronLeft size={14} />
                </button>

                <span className="text-ds-text2 text-sm">
                    {meta.current_page} / {meta.last_page}
                </span>

                <button
                    onClick={() => goTo(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="border-ds-border rounded px-3 py-1"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

/* ---------------- PAGE ---------------- */

export default function Index({ briefs, candidats, filters }: Props) {
    const [briefId, setBriefId] = useState<number | ''>(filters.brief_id ?? '');

    function handleSelect(id: number | '') {
        setBriefId(id);

        router.get(route('dashboard.sourcing.index'), id ? { brief_id: id } : {}, { preserveState: true });
    }

    return (
        <>
            <Head title="Sourcing" />

            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">Sourcing</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">Sélectionnez un brief pour afficher les candidats sourcés</p>
                    </div>

                    {/* Select */}
                    <div className="mb-6 max-w-md">
                        <select
                            value={briefId}
                            onChange={(e) => handleSelect(e.target.value ? Number(e.target.value) : '')}
                            className="border-ds-border bg-ds-bg3 text-ds-text w-full rounded-lg border px-3 py-2 text-[13px]"
                        >
                            <option value="">-- Choisir un brief --</option>
                            {briefs.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* No brief selected */}
                    {!briefId && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Briefcase className="text-ds-accent" size={24} />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">Aucun brief sélectionné</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">Choisissez un brief pour voir les candidats</p>
                        </div>
                    )}

                    {/* No candidats */}
                    {briefId && candidats && candidats.data.length === 0 && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-24 text-center">
                            <p className="text-ds-text2 text-[13px]">Aucun candidat trouvé pour ce brief</p>
                        </div>
                    )}

                    {/* Table */}
                    {briefId && candidats && candidats.data.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <CandidateTable
                                    data={candidats.data}
                                    onDelete={(candidat) => setDeletingCandidat(candidat)}
                                />
                            </div>

                            <div className="px-4 pb-4">
                                <Pagination meta={candidats} brief_id={typeof briefId === 'number' ? briefId : undefined} />
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}

