import { useI18n } from '@/hooks/useI18n';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';

type Props = {
    error?: string;
};

export default function Fallback({ error }: Props) {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('briefs.fallback.title')} />
            <AppSidebarLayout>
                <div className="min-h-screen bg-gray-50 p-8 text-gray-900 dark:bg-[#0A0A0F] dark:text-white">
                    {/* HEADER */}
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <p className="text-xs text-gray-500">{t('briefs.fallback.breadcrumb')}</p>
                            <h1 className="text-secondary text-2xl font-bold">{t('briefs.fallback.title')}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('briefs.fallback.subtitle')}</p>
                        </div>
                        <Link
                            href={route('dashboard.briefs.index')}
                            className="bg-secondary flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            {t('briefs.fallback.actions.back')}
                        </Link>
                    </div>

                    {/* ERROR CARD */}
                    <div className="flex flex-col items-center justify-center py-24">
                        {/* Icon */}
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                />
                            </svg>
                        </div>

                        {/* Message */}
                        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{t('briefs.fallback.heading')}</h2>
                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">{t('briefs.fallback.description')}</p>

                        {/* Raw error detail (shown only if provided) */}
                        {error && <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-500 dark:bg-red-500/10">{error}</p>}

                        {/* Actions */}
                        <div className="mt-8 flex items-center gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                    />
                                </svg>
                                {t('briefs.fallback.actions.retry')}
                            </button>

                            <Link
                                href={route('dashboard.briefs.index')}
                                className="bg-secondary flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
                            >
                                {t('briefs.fallback.actions.back')}
                            </Link>
                        </div>
                    </div>
                </div>
            </AppSidebarLayout>
        </>
    );
}
