import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Props {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: Props) {
    return (
        <AppLayout>
            <Head title={title} />
            <div className="bg-ds-bg flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
                <div className="bg-ds-accent/10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
                    <span className="text-3xl">🚀</span>
                </div>
                <h1 className="font-heading text-ds-text text-2xl font-bold">{title}</h1>
                <p className="text-ds-text2 mt-2 max-w-sm text-sm">{description}</p>
                <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 mt-6 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold">
                    Bientôt disponible
                </span>
            </div>
        </AppLayout>
    );
}
