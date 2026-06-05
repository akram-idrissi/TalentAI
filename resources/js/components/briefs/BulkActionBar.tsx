import { ALL_STATUSES, STATUS_CONFIG } from '@/constants/briefs';
import { Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function BulkActionBar({
    count,
    canEdit,
    canDelete,
    onStatusChange,
    onDelete,
    onClear,
}: {
    count: number;
    canEdit: boolean;
    canDelete: boolean;
    onStatusChange: (status: string) => void;
    onDelete: () => void;
    onClear: () => void;
}) {
    const [statusOpen, setStatusOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!statusOpen) return;
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setStatusOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [statusOpen]);

    if (count === 0) return null;

    return (
        <div className="animate-in slide-in-from-bottom-4 border-ds-border bg-ds-surface fixed inset-x-0 bottom-6 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl duration-200">
            <span className="text-ds-text2 shrink-0 text-[13px] font-semibold">
                {count} sélectionné{count > 1 ? 's' : ''}
            </span>

            <div className="bg-ds-border mx-1 h-5 w-px shrink-0" />

            {canEdit && (
                <div ref={ref} className="relative">
                    <button
                        onClick={() => setStatusOpen((v) => !v)}
                        className="border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition"
                    >
                        Changer le statut
                        <svg className="h-3 w-3 opacity-60" viewBox="0 0 10 10">
                            <path
                                d="M2 3.5l3 3 3-3"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    {statusOpen && (
                        <div className="border-ds-border bg-ds-surface absolute bottom-full left-0 mb-2 min-w-[160px] overflow-hidden rounded-xl border shadow-xl">
                            {ALL_STATUSES.map((s) => {
                                const sCfg = STATUS_CONFIG[s.value];
                                return (
                                    <button
                                        key={s.value}
                                        onClick={() => {
                                            setStatusOpen(false);
                                            onStatusChange(s.value);
                                        }}
                                        className="hover:bg-ds-bg3/60 flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition"
                                    >
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCfg.className}`}>
                                            {s.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {canDelete && (
                <button
                    onClick={onDelete}
                    className="border-ds-red/30 text-ds-red hover:bg-ds-red/10 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition"
                >
                    <Trash2 size={12} />
                    Supprimer
                </button>
            )}

            <button
                onClick={onClear}
                aria-label="Désélectionner tout"
                className="border-ds-border text-ds-text3 hover:text-ds-text ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition"
            >
                <X size={13} />
            </button>
        </div>
    );
}
