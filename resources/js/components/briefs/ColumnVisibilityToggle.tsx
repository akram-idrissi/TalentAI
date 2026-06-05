import { useI18n } from '@/hooks/useI18n';
import { Columns3 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface ColumnDef {
    key: string;
    label: string;
}

interface Props {
    columns: ColumnDef[];
    visible: Set<string>;
    onChange: (key: string, checked: boolean) => void;
}

export default function ColumnVisibilityToggle({ columns, visible, onChange }: Props) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [open]);

    const hiddenCount = columns.filter((c) => !visible.has(c.key)).length;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={t('briefs.index.column_visibility.button_label')}
                title={t('briefs.index.column_visibility.button_title')}
                className={[
                    'border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-medium transition',
                    open ? 'border-ds-accent/40 text-ds-accent' : '',
                ].join(' ')}
            >
                <Columns3 size={14} />
                <span className="hidden sm:inline">{t('briefs.index.column_visibility.button_text')}</span>
                {hiddenCount > 0 && (
                    <span className="bg-ds-accent flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                        {hiddenCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="border-ds-border bg-ds-surface absolute top-full right-0 z-50 mt-1.5 w-52 overflow-hidden rounded-xl border shadow-xl">
                    <div className="border-ds-border border-b px-3 py-2">
                        <p className="text-ds-text3 text-[10px] font-semibold tracking-wide uppercase">
                            {t('briefs.index.column_visibility.panel_heading')}
                        </p>
                    </div>
                    <div className="py-1">
                        {columns.map((col) => {
                            const isVisible = visible.has(col.key);
                            return (
                                <label key={col.key} className="hover:bg-ds-bg3/60 flex cursor-pointer items-center gap-2.5 px-3 py-2 transition">
                                    <span
                                        className={[
                                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
                                            isVisible ? 'border-ds-accent bg-ds-accent' : 'border-ds-border bg-transparent',
                                        ].join(' ')}
                                    >
                                        {isVisible && (
                                            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none">
                                                <path
                                                    d="M1.5 5l2.5 2.5 4.5-4"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isVisible}
                                        onChange={(e) => onChange(col.key, e.target.checked)}
                                    />
                                    <span className="text-ds-text2 text-[12px]">{col.label}</span>
                                </label>
                            );
                        })}
                    </div>

                    {hiddenCount > 0 && (
                        <div className="border-ds-border border-t px-3 py-2">
                            <button
                                onClick={() => columns.forEach((c) => onChange(c.key, true))}
                                className="text-ds-accent text-[11px] underline-offset-2 hover:underline"
                            >
                                {t('briefs.index.column_visibility.show_all')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
