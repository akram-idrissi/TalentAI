import { ReactNode } from 'react';
type BadgeColor = 'blue' | 'violet' | 'green' | 'red';

type BadgeProps = {
    children: ReactNode;
    color?: BadgeColor;
};

export function Badge({ children, color = 'blue' }: BadgeProps) {
    const styles: Record<BadgeColor, string> = {
        blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
        green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    };

    return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[color]}`}>{children}</span>;
}
