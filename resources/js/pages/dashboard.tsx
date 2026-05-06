import ActiveBriefsTable from '@/components/dashboard/ActiveBriefsTable';
import RecentActivity from '@/components/dashboard/RecentActivity';
import StatCard from '@/components/dashboard/StatCard';
import TopCandidates from '@/components/dashboard/TopCandidates';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const stats = [
    { title: 'Profils sourcés', value: 142, trend: '23 cette semaine', trendType: 'up' as const, accentColor: 'blue' as const },
    { title: 'CV analysés par IA', value: 87, trend: "12 aujourd'hui", trendType: 'up' as const, accentColor: 'green' as const },
    { title: 'Entretiens traités', value: 19, trend: '4 cette semaine', trendType: 'up' as const, accentColor: 'amber' as const },
    { title: 'Offres en cours', value: 6, trend: 'stable', trendType: 'stable' as const, accentColor: 'purple' as const },
];

const briefs = [
    { id: 1, title: 'Directeur Commercial', location: 'Casablanca', contractType: 'CDI', candidatesCount: 18, status: 'active' as const },
    { id: 2, title: 'Lead Dev React', location: 'Rabat', contractType: 'CDI', candidatesCount: 31, status: 'active' as const },
    { id: 3, title: 'CFO Groupe', location: 'Casablanca', contractType: 'CDI', candidatesCount: 9, status: 'sourcing' as const },
    { id: 4, title: 'Responsable RH', location: 'Marrakech', contractType: 'CDD', candidatesCount: 14, status: 'interview' as const },
];

const topCandidates = [
    { rank: 1, name: 'Karim Benali', role: 'Dir. Commercial', experience: 14, score: 94 },
    { rank: 2, name: 'Asmaa Tazi', role: 'Lead Dev', experience: 9, score: 88 },
    { rank: 3, name: 'Youssef Alami', role: 'CFO', experience: 11, score: 82 },
];

const activities = [
    {
        id: 1,
        time: 'Il y a 2h',
        title: 'Analyse IA terminée · Directeur Commercial',
        description: '18 CVs analysés · Karim Benali classé #1 avec un score de 94/100',
        dotColor: 'green' as const,
    },
    {
        id: 2,
        time: 'Il y a 5h',
        title: 'Entretien transcrit · Asmaa Tazi',
        description: 'Enregistrement Zoom de 47 min · Rapport IA généré',
        dotColor: 'blue' as const,
    },
    {
        id: 3,
        time: 'Hier',
        title: 'Sourcing LinkedIn · 23 nouveaux profils',
        description: 'Brief CFO Groupe · 23 profils sourcés · 8 retenus par le filtre IA',
        dotColor: 'amber' as const,
    },
    {
        id: 4,
        time: 'Avant-hier',
        title: 'Nouveau brief créé · Responsable RH Marrakech',
        description: 'Profil senior · 8 ans min · Bac+5',
        dotColor: 'blue' as const,
    },
];

export default function Dashboard() {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const firstName = auth?.user?.name?.split(' ')[0] ?? '';
    const weekLabel = `Semaine du ${dayjs().startOf('week').add(1, 'day').format('D MMMM YYYY')}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="bg-ds-bg min-h-full px-4 py-8 sm:px-6 lg:px-9">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="font-heading text-ds-text text-[26px] font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-ds-text2 mt-1 text-[14px]">
                        {weekLabel}
                        {firstName && <> · Bienvenue {firstName}</>}
                    </p>
                </div>

                {/* Stat cards — 2 cols on mobile, 4 on desktop */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>

                {/* Briefs + top candidates — stacked on mobile, side by side on desktop */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                        <ActiveBriefsTable briefs={briefs} />
                    </div>
                    <div className="lg:col-span-2">
                        <TopCandidates candidates={topCandidates} onViewAll={() => {}} />
                    </div>
                </div>

                {/* Recent activity */}
                <RecentActivity activities={activities} />
            </div>
        </AppLayout>
    );
}
