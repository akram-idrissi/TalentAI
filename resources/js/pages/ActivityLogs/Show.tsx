import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { ShowPageProps } from '@/types/activity_logs';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Activity, ArrowLeft, Code2, Globe, Hash, Monitor, Shield, ShieldCheck, ShieldOff, Tag, User } from 'lucide-react';
import { ActionBadge } from './components/ActionBadge';
import { Field } from './components/Field';
import { HttpMethodBadge } from './components/HttpMethodBadge';
import { JsonViewer } from './components/JsonViewer';
import { Section } from './components/Section';
import { UserAvatar } from './components/UserAvatar';
dayjs.extend(relativeTime);
dayjs.locale('fr');
export default function ActivityLogsShow({ log }: ShowPageProps) {
    const { t } = useI18n();

    return (
        <>
            <Head title={t('activity_logs.show.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href={route('dashboard.activity-logs.index')}
                            className="text-ds-text3 hover:text-ds-text mb-4 inline-flex items-center gap-1.5 text-[13px] transition"
                        >
                            <ArrowLeft size={13} />
                            {t('activity_logs.show.back')}
                        </Link>

                        <div className="mt-3 flex items-start gap-3">
                            <div className="bg-ds-accent/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                                <Activity size={16} className="text-ds-accent" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-heading text-ds-text text-[26px] leading-none font-bold">{t('activity_logs.show.title')}</h1>
                                <p className="text-ds-text2 mt-0.5 text-[14px]">
                                    #{log.id} · {dayjs(log.logged_at).format('DD MMM YYYY, HH:mm:ss')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* ── Action & Description ── */}
                        <Section icon={Tag} title={t('activity_logs.show.sections.action')}>
                            <Field label={t('activity_logs.show.fields.action')}>
                                <ActionBadge action={log.action} />
                            </Field>
                            <Field label={t('activity_logs.show.fields.description')}>
                                <span className="leading-relaxed">{log.description || '—'}</span>
                            </Field>
                            <Field label={t('activity_logs.show.fields.logged_at')}>
                                <span className="font-mono text-[12px]">{dayjs(log.logged_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                                <span className="text-ds-text3 ml-2 text-[11px]">({dayjs(log.logged_at).fromNow()})</span>
                            </Field>
                        </Section>

                        {/* ── User ── */}
                        <Section icon={User} title={t('activity_logs.show.sections.user')}>
                            <Field label={t('activity_logs.show.fields.user')}>
                                {log.user_name ? (
                                    <div className="flex items-center gap-2.5">
                                        <UserAvatar name={log.user_name} size="md" className="from-[#6C63FF] to-[#38BDF8]" />
                                        <div>
                                            <p className="text-ds-text font-medium">{log.user_name}</p>
                                            <p className="text-ds-text3 text-[11px]">{log.user_email ?? '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-ds-text3 italic">{t('activity_logs.index.unknown_user')}</span>
                                )}
                            </Field>
                            <Field label={t('activity_logs.show.fields.role')}>
                                {log.user_role ? (
                                    <span className="border-ds-border bg-ds-bg3 text-ds-text2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                                        <Shield size={10} className="mr-1" />
                                        {log.user_role}
                                    </span>
                                ) : (
                                    <span className="text-ds-text3">—</span>
                                )}
                            </Field>
                            <Field label={t('activity_logs.show.fields.authenticated')}>
                                <span className="inline-flex items-center gap-1.5">
                                    {log.is_authenticated ? (
                                        <>
                                            <ShieldCheck size={14} className="text-badge-active-text" />
                                            <span className="text-badge-active-text text-[12px] font-medium">{t('activity_logs.show.yes')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldOff size={14} className="text-ds-red" />
                                            <span className="text-ds-red text-[12px] font-medium">{t('activity_logs.show.no')}</span>
                                        </>
                                    )}
                                </span>
                            </Field>
                        </Section>

                        {/* ── HTTP & Request ── */}
                        <Section icon={Globe} title={t('activity_logs.show.sections.request')}>
                            <Field label={t('activity_logs.show.fields.http_method')}>
                                <HttpMethodBadge method={log.http_method} />
                            </Field>
                            <Field label={t('activity_logs.show.fields.url')}>
                                {log.url ? (
                                    <span className="text-ds-text2 font-mono text-[12px] break-all">{log.url}</span>
                                ) : (
                                    <span className="text-ds-text3">—</span>
                                )}
                            </Field>
                            <Field label={t('activity_logs.show.fields.ip_address')}>
                                <span className="font-mono text-[12px]">{log.ip_address ?? '—'}</span>
                            </Field>
                        </Section>

                        {/* ── Controller ── */}
                        <Section icon={Code2} title={t('activity_logs.show.sections.controller')}>
                            <Field label={t('activity_logs.show.fields.controller')}>
                                {log.controller ? (
                                    <span className="text-ds-text2 font-mono text-[12px] break-all">{log.controller}</span>
                                ) : (
                                    <span className="text-ds-text3">—</span>
                                )}
                            </Field>
                            <Field label={t('activity_logs.show.fields.controller_method')}>
                                {log.controller_method ? (
                                    <span className="border-ds-accent/20 bg-ds-accent/10 text-ds-accent2 inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px]">
                                        {log.controller_method}
                                    </span>
                                ) : (
                                    <span className="text-ds-text3">—</span>
                                )}
                            </Field>
                        </Section>

                        {/* ── Models ── */}
                        <Section icon={Hash} title={t('activity_logs.show.sections.models')}>
                            <div className="px-5 py-3.5">
                                {log.models && log.models.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {log.models.map((model, i) => (
                                            <span
                                                key={i}
                                                className="border-ds-border bg-ds-bg3 text-ds-text2 inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px]"
                                            >
                                                {model}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-ds-text3 text-[13px]">—</span>
                                )}
                            </div>
                        </Section>

                        {/* ── Properties ── */}
                        <Section icon={Monitor} title={t('activity_logs.show.sections.properties')}>
                            <div className="px-5 py-3.5">
                                <JsonViewer data={log.properties} />
                            </div>
                        </Section>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
