import type { PaginationMeta } from '@/types/brief';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, filters, sortBy, sortDir }: { meta: PaginationMeta; filters: string; sortBy: string; sortDir: string }) {
    const { current_page, last_page, from, to, total } = meta;
    if (last_page <= 1) return null;

    function goTo(page: number) {
        router.get(
            route('dashboard.briefs.index'),
            {
                page,
                ...(filters ? { filters } : {}),
                ...(sortBy !== 'created_at' ? { sort_by: sortBy } : {}),
                ...(sortDir !== 'desc' ? { sort_dir: sortDir } : {}),
            },
            { preserveState: true, preserveScroll: false },
        );
    }

    const pages = Array.from({ length: last_page }, (_, i) => i + 1);
    const visible = pages.filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);

    const btnBase = 'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition';
    const btnIdle = 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text';
    const btnActive = 'border-ds-accent bg-ds-accent text-white';
    const btnDisabled = 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50';

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
            <p className="text-ds-text3">{from != null && to != null ? `${from}–${to} sur ${total} briefs` : `${total} briefs`}</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    aria-label="Page précédente"
                    className={`${btnBase} ${current_page === 1 ? btnDisabled : btnIdle}`}
                >
                    <ChevronLeft size={13} />
                </button>

                {visible.map((p, i) => (
                    <span key={p} className="flex items-center gap-1">
                        {i > 0 && visible[i - 1] !== p - 1 && <span className="text-ds-text3 px-0.5">…</span>}
                        <button
                            onClick={() => goTo(p)}
                            aria-current={p === current_page ? 'page' : undefined}
                            className={`${btnBase} ${p === current_page ? btnActive : btnIdle}`}
                        >
                            {p}
                        </button>
                    </span>
                ))}

                <button
                    onClick={() => goTo(current_page + 1)}
                    disabled={current_page === last_page}
                    aria-label="Page suivante"
                    className={`${btnBase} ${current_page === last_page ? btnDisabled : btnIdle}`}
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}
