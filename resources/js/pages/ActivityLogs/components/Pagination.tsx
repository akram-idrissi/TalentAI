import { router } from '@inertiajs/react';

import { PaginationMeta } from '@/types';
import { PageProps } from '@/types/activity_logs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
    meta,
    filters,
    t,
}: {
    meta: PaginationMeta;
    filters: PageProps['filters'];
    t: (key: string, opts?: Record<string, string | number>) => string;
}) {
    const { current_page, last_page, from, to, total } = meta;
    if (last_page <= 1) return null;

    function goTo(page: number) {
        router.get(route('dashboard.activity-logs.index'), { page, ...filters }, { preserveState: true, preserveScroll: false });
    }

    const pages = Array.from({ length: last_page }, (_, i) => i + 1);
    const visible = pages.filter((p) => p === 1 || p === last_page || Math.abs(p - current_page) <= 2);

    const btnBase = 'flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-[12px] transition';
    const btnIdle = 'border-ds-border text-ds-text2 hover:border-ds-border2 hover:text-ds-text';
    const btnActive = 'border-ds-accent bg-ds-accent text-white';
    const btnDisabled = 'border-ds-border text-ds-text3 cursor-not-allowed opacity-50';

    const summary =
        from != null && to != null
            ? t('activity_logs.index.pagination.summary', { from, to, total })
            : t('activity_logs.index.pagination.total', { total });

    return (
        <div className="mt-4 flex items-center justify-between text-[13px]">
            <p className="text-ds-text3">{summary}</p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => goTo(current_page - 1)}
                    disabled={current_page === 1}
                    className={`${btnBase} ${current_page === 1 ? btnDisabled : btnIdle}`}
                    aria-label={t('activity_logs.index.pagination.prev')}
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
                    aria-label={t('activity_logs.index.pagination.next')}
                >
                    <ChevronRight size={13} />
                </button>
            </div>
        </div>
    );
}
