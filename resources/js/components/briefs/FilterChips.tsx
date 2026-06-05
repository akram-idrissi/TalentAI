import { FilterEntry } from '@/components/ui/FilterPanel';
import { X } from 'lucide-react';
export default function FilterChips({
    filters,
    fieldLabels,
    onRemove,
    onClearAll,
}: {
    filters: FilterEntry[];
    fieldLabels: Record<string, string>;
    onRemove: (field: string) => void;
    onClearAll: () => void;
}) {
    const active = filters.filter((f) => (Array.isArray(f.value) ? f.value.length > 0 : f.value?.toString().trim() !== ''));

    if (active.length === 0) return null;

    return (
        <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-ds-text3 text-[11px] font-semibold tracking-wide uppercase">Filtres :</span>
            {active.map((f) => {
                const display = Array.isArray(f.value) ? f.value.join(', ') : String(f.value);
                return (
                    <span
                        key={f.field}
                        className="border-ds-border bg-ds-surface text-ds-text2 flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-3 text-[12px]"
                    >
                        <span className="text-ds-text3 font-medium">{fieldLabels[f.field] ?? f.field} :</span>
                        <span className="max-w-[120px] truncate">{display}</span>
                        <button
                            onClick={() => onRemove(f.field)}
                            aria-label={`Supprimer le filtre ${fieldLabels[f.field] ?? f.field}`}
                            className="text-ds-text3 hover:text-ds-red hover:bg-ds-red/10 ml-0.5 flex h-4 w-4 items-center justify-center rounded-full transition"
                        >
                            <X size={10} />
                        </button>
                    </span>
                );
            })}
            {active.length > 1 && (
                <button onClick={onClearAll} className="text-ds-text3 hover:text-ds-red text-[12px] underline-offset-2 transition hover:underline">
                    Tout effacer
                </button>
            )}
        </div>
    );
}
