import { ALL_STATUSES, STATUS_CONFIG } from '@/constants/briefs';
import type { Brief } from '@/types/brief';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function StatusBadge({
    brief,
    onStatusChanged,
    canEdit,
}: {
    brief: Brief;
    onStatusChanged: (briefId: number, newStatus: string) => void;
    canEdit: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const [dropUp, setDropUp] = useState(false);

    const cfg = STATUS_CONFIG[brief.status] ?? {
        label: brief.status,
        className: 'bg-ds-bg3 text-ds-text2 border border-ds-border',
    };

    useEffect(() => {
        if (!open) return;
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [open]);

    function handleOpen() {
        if (!canEdit) return;
        if (btnRef.current) {
            const { bottom } = btnRef.current.getBoundingClientRect();
            setDropUp(window.innerHeight - bottom < 180);
        }
        setOpen((v) => !v);
    }

    function changeStatus(newStatus: string) {
        if (newStatus === brief.status || loading) return;
        const previousStatus = brief.status;
        setLoading(true);
        setOpen(false);

        // Optimistic update
        onStatusChanged(brief.id, newStatus);
        fetch(route('dashboard.briefs.update-status', brief.id), {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    console.error('Status update failed', res.status, data);
                    throw new Error('Server error');
                }

                const newLabel = STATUS_CONFIG[newStatus]?.label ?? newStatus;

                // Show toast with undo action
                toast.success(
                    (t) => (
                        <span className="flex items-center gap-3">
                            <span>
                                Statut mis à jour : <strong>{newLabel}</strong>
                            </span>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    onStatusChanged(brief.id, previousStatus);
                                    fetch(route('dashboard.briefs.update-status', brief.id), {
                                        method: 'PATCH',
                                        credentials: 'same-origin',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Accept: 'application/json',
                                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                                            'X-Requested-With': 'XMLHttpRequest',
                                        },
                                        body: JSON.stringify({ status: previousStatus }),
                                    }).catch((error) => {
                                        console.log(error);
                                    });

                                    toast.success('Action annulée.');
                                }}
                                className="text-ds-accent ml-1 shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold underline-offset-2 hover:underline"
                            >
                                Annuler
                            </button>
                        </span>
                    ),
                    { duration: 5000 },
                );
            })
            .catch((error) => {
                console.error('Error updating status:', error);
                // Revert optimistic update on error
                onStatusChanged(brief.id, previousStatus);
                toast.error('Impossible de changer le statut.');
            })
            .finally(() => setLoading(false));
    }

    return (
        <div ref={ref} className="relative inline-block">
            <button
                ref={btnRef}
                disabled={!canEdit || loading}
                onClick={handleOpen}
                aria-haspopup="listbox"
                aria-expanded={open}
                title={canEdit ? 'Changer le statut' : undefined}
                className={[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                    cfg.className,
                    canEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                    loading ? 'animate-pulse' : '',
                ].join(' ')}
            >
                {cfg.label}
                {canEdit && !loading && (
                    <svg className="h-2.5 w-2.5 opacity-60" viewBox="0 0 10 10" fill="currentColor">
                        <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {open && (
                <div
                    role="listbox"
                    className={[
                        'border-ds-border bg-ds-surface absolute left-0 z-50 min-w-[150px] overflow-hidden rounded-xl border shadow-xl',
                        dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
                    ].join(' ')}
                >
                    {ALL_STATUSES.map((s) => {
                        const sCfg = STATUS_CONFIG[s.value];
                        const isActive = s.value === brief.status;
                        return (
                            <button
                                key={s.value}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => changeStatus(s.value)}
                                className={[
                                    'hover:bg-ds-bg3/60 flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition',
                                    isActive ? 'font-semibold' : 'text-ds-text2',
                                ].join(' ')}
                            >
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${sCfg.className}`}>{s.label}</span>
                                {isActive && (
                                    <svg className="text-ds-accent ml-auto h-3 w-3" viewBox="0 0 12 12">
                                        <path
                                            d="M2 6l3 3 5-5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
