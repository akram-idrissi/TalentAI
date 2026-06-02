import * as LucideIcons from 'lucide-react';
import { HelpCircle, type LucideIcon, type LucideProps } from 'lucide-react';

export function IntegrationIcon({ name, ...props }: { name: string } & LucideProps) {
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    const Icon = icons[name] ?? HelpCircle;

    return <Icon {...props} />;
}
