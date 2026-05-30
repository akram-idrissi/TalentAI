import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';

import AppearanceTabs from '@/components/appearance-tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">Apparence</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">Personnalisez l'apparence de l'interface selon vos préférences.</p>
                    </div>

                    {/* Theme card */}
                    <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                        {/* Card header */}
                        <div className="border-ds-border flex items-center gap-3 border-b px-5 py-4">
                            <div className="bg-ds-accent/10 flex h-7 w-7 items-center justify-center rounded-lg">
                                <Palette size={14} className="text-ds-accent" />
                            </div>
                            <div>
                                <p className="font-heading text-ds-text text-[14px] font-semibold">Thème d'interface</p>
                                <p className="text-ds-text3 text-[12px]">Choisissez entre le mode clair, sombre ou système</p>
                            </div>
                        </div>

                        {/* Tabs content */}
                        <div className="px-5 py-5">
                            <AppearanceTabs />
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
