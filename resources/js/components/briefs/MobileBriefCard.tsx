import type { Brief } from '@/types/brief';
import { Link } from '@inertiajs/react';
import { CheckSquare, Copy, Edit2, Eye, Square, Trash2 } from 'lucide-react';

import BriefAvatar from '@/components/briefs/BriefAvatar';
import ContractBadge from '@/components/briefs/ContractBadge';
import StatusBadge from '@/components/briefs/StatusBadge';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

export default function MobileBriefCard({
    brief,
    index,
    canEdit,
    canCreate,
    selected,
    onToggleSelect,
    onStatusChanged,
    onDelete,
    onDuplicate,
    duplicating,
}: {
    brief: Brief;
    index: number;
    canEdit: boolean;
    canCreate: boolean;
    selected: boolean;
    onToggleSelect: (id: number) => void;
    onStatusChanged: (id: number, status: string) => void;
    onDelete: (brief: Brief) => void;
    onDuplicate: (brief: Brief) => void;
    duplicating: boolean;
}) {
    return (
        <div
            className={[
                'border-ds-border bg-ds-surface mb-3 rounded-xl border p-4 transition',
                selected ? 'border-ds-accent/40 bg-ds-accent/5' : '',
            ].join(' ')}
        >
            <div className="mb-3 flex items-center gap-3">
                <button
                    onClick={() => onToggleSelect(brief.id)}
                    aria-label={selected ? 'Désélectionner' : 'Sélectionner'}
                    className="text-ds-text3 hover:text-ds-accent shrink-0 transition"
                >
                    {selected ? <CheckSquare size={16} className="text-ds-accent" /> : <Square size={16} />}
                </button>
                <BriefAvatar title={brief.title} index={index} />
                <div className="min-w-0 flex-1">
                    <p className="font-heading text-ds-text truncate font-semibold">{brief.title}</p>
                    <p className="text-ds-text3 text-[11px]">
                        {brief.location} · {brief.contract_type}
                    </p>
                </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                <div>
                    <p className="text-ds-text3 text-[10px] font-semibold tracking-wide uppercase">Secteur</p>
                    <p className="text-ds-text2">{brief.sector}</p>
                </div>
                <div>
                    <p className="text-ds-text3 text-[10px] font-semibold tracking-wide uppercase">Expérience</p>
                    <p className="text-ds-text2">{brief.min_experience_years} ans</p>
                </div>
                <div>
                    <p className="text-ds-text3 text-[10px] font-semibold tracking-wide uppercase">Créé</p>
                    <p className="text-ds-text2">{dayjs(brief.created_at).fromNow()}</p>
                </div>
                <div>
                    <p className="text-ds-text3 text-[10px] font-semibold tracking-wide uppercase">Statut</p>
                    <StatusBadge brief={brief} onStatusChanged={onStatusChanged} canEdit={canEdit} />
                </div>
            </div>

            <div className="border-ds-border flex items-center justify-between border-t pt-3">
                <ContractBadge type={brief.contract_type} />
                <div className="flex items-center gap-1.5">
                    <Link
                        href={route('dashboard.briefs.show', brief.id)}
                        aria-label="Voir"
                        className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 w-7 items-center justify-center rounded-lg border transition"
                    >
                        <Eye size={13} />
                    </Link>
                    {canEdit && (
                        <Link
                            href={route('dashboard.briefs.edit', brief.id)}
                            aria-label="Modifier"
                            className="border-ds-border text-ds-text3 hover:border-ds-amber/40 hover:text-ds-amber flex h-7 w-7 items-center justify-center rounded-lg border transition"
                        >
                            <Edit2 size={13} />
                        </Link>
                    )}
                    {canCreate && (
                        <button
                            onClick={() => onDuplicate(brief)}
                            disabled={duplicating}
                            aria-label="Dupliquer"
                            className={`border-ds-border text-ds-text3 hover:border-ds-accent/40 hover:text-ds-accent flex h-7 w-7 items-center justify-center rounded-lg border transition ${duplicating ? 'animate-pulse cursor-wait opacity-60' : ''}`}
                        >
                            <Copy size={13} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(brief)}
                        aria-label="Supprimer"
                        className="border-ds-border text-ds-text3 hover:border-ds-red/40 hover:text-ds-red flex h-7 w-7 items-center justify-center rounded-lg border transition"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}
