import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string; description: string }[] = [
        { value: 'light', icon: Sun, label: 'Clair', description: 'Interface lumineuse' },
        { value: 'dark', icon: Moon, label: 'Sombre', description: 'Interface en mode nuit' },
        { value: 'system', icon: Monitor, label: 'Système', description: 'Suit les préférences OS' },
    ];

    return (
        <div className={cn('grid gap-3 sm:grid-cols-3', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label, description }) => {
                const isActive = appearance === value;
                return (
                    <button
                        key={value}
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'flex flex-col items-start gap-2.5 rounded-xl border px-4 py-3.5 text-left transition',
                            isActive
                                ? 'border-ds-accent bg-ds-accent/5 ring-ds-accent/20 ring-1'
                                : 'border-ds-border bg-ds-bg3 hover:border-ds-border2 hover:bg-ds-surface',
                        )}
                    >
                        <span
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition',
                                isActive ? 'bg-ds-accent text-white' : 'bg-ds-surface text-ds-text3',
                            )}
                        >
                            <Icon size={15} />
                        </span>
                        <span className="grid gap-0.5">
                            <span className={cn('text-[13px] font-semibold', isActive ? 'text-ds-accent' : 'text-ds-text')}>{label}</span>
                            <span className="text-ds-text3 text-[11px]">{description}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
