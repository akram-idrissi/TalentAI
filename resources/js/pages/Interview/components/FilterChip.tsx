import { X } from 'lucide-react';
export default function FilterChip({
    label,
    active,
    onClick,
    onClear,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    onClear?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition select-none',
                active
                    ? 'border-ds-accent bg-ds-accent/10 text-ds-accent'
                    : 'border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text',
            ].join(' ')}
        >
            {label}
            {active && onClear && (
                <X
                    size={10}
                    className="shrink-0 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                />
            )}
        </button>
    );
}
