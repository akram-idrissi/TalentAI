import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string };

type SelectProps = {
    value?: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
};

export default function Select({ value, onChange, options = [], placeholder = 'Select...', className = '' }: SelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="border-ds-border bg-ds-bg3 text-ds-text hover:border-ds-border2 hover:bg-ds-surface flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150"
            >
                <span>{selected?.label ?? placeholder}</span>
                <ChevronDown size={12} className={`text-ds-text3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="border-ds-border2 bg-ds-surface absolute right-0 z-50 mt-1.5 min-w-[90px] overflow-hidden rounded-xl border shadow-xl">
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] transition-colors duration-100 ${
                                    isSelected
                                        ? 'bg-ds-accent/8 text-ds-accent font-semibold'
                                        : 'text-ds-text2 hover:bg-ds-accent/[0.06] hover:text-ds-text'
                                }`}
                            >
                                <span className="flex-1">{opt.label}</span>
                                {isSelected && <Check size={13} className="text-ds-accent shrink-0" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
