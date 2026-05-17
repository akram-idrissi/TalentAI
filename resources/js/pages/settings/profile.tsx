import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, Shield, User } from 'lucide-react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const initials = auth.user.name
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">Paramètres du profil</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">Gérez vos informations personnelles et vos préférences de compte.</p>
                    </div>

                    <div className="space-y-5">
                        {/* Identity card */}
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            {/* Card header */}
                            <div className="border-ds-border flex items-center gap-3 border-b px-5 py-4">
                                <div className="bg-ds-accent/10 flex h-7 w-7 items-center justify-center rounded-lg">
                                    <User size={14} className="text-ds-accent" />
                                </div>
                                <div>
                                    <p className="font-heading text-ds-text text-[14px] font-semibold">Informations du profil</p>
                                    <p className="text-ds-text3 text-[12px]">Nom et adresse e-mail affichés sur votre compte</p>
                                </div>
                            </div>

                            {/* Avatar row */}
                            <div className="border-ds-border flex items-center gap-4 border-b px-5 py-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-[#38BDF8] text-[15px] font-bold text-white">
                                    {initials}
                                </div>
                                <div>
                                    <p className="font-heading text-ds-text font-semibold">{auth.user.name}</p>
                                    <p className="text-ds-text3 text-[13px]">{auth.user.email}</p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={submit} className="px-5 py-5">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {/* Name */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="name" className="text-ds-text2 text-[11px] font-semibold tracking-[0.8px] uppercase">
                                            Nom complet
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Nom complet"
                                            className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border px-3 py-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                        />
                                        <InputError className="text-[12px]" message={errors.name} />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="email" className="text-ds-text2 text-[11px] font-semibold tracking-[0.8px] uppercase">
                                            Adresse e-mail
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="Adresse e-mail"
                                            className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border px-3 py-2.5 text-[13px] focus:ring-1 focus:outline-none"
                                        />
                                        <InputError className="text-[12px]" message={errors.email} />
                                    </div>
                                </div>

                                {/* Unverified email notice */}
                                {mustVerifyEmail && auth.user.email_verified_at === null && (
                                    <div className="border-ds-border bg-ds-bg3 mt-4 rounded-lg border px-4 py-3">
                                        <div className="flex items-start gap-2">
                                            <Mail size={14} className="text-ds-amber mt-0.5 shrink-0" />
                                            <p className="text-ds-text2 text-[12px] leading-5">
                                                Votre adresse e-mail n'est pas encore vérifiée.{' '}
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className="text-ds-accent hover:text-ds-accent/80 underline underline-offset-2 transition"
                                                >
                                                    Renvoyer le lien de vérification.
                                                </Link>
                                            </p>
                                        </div>

                                        {status === 'verification-link-sent' && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-green-600">
                                                <CheckCircle2 size={13} />
                                                Un nouveau lien a été envoyé à votre adresse e-mail.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Footer actions */}
                                <div className="border-ds-border mt-5 flex items-center gap-3 border-t pt-5">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                                    >
                                        {processing ? 'Enregistrement…' : 'Enregistrer'}
                                    </button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-200"
                                        enterFrom="opacity-0 translate-y-1"
                                        enterTo="opacity-100 translate-y-0"
                                        leave="transition ease-in-out duration-150"
                                        leaveTo="opacity-0"
                                    >
                                        <span className="flex items-center gap-1.5 text-[13px] font-medium text-green-600">
                                            <CheckCircle2 size={14} />
                                            Enregistré
                                        </span>
                                    </Transition>
                                </div>
                            </form>
                        </div>

                        {/* Security / danger zone card */}
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="border-ds-border flex items-center gap-3 border-b px-5 py-4">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                                    <Shield size={14} className="text-ds-red" />
                                </div>
                                <div>
                                    <p className="font-heading text-ds-text text-[14px] font-semibold">Zone dangereuse</p>
                                    <p className="text-ds-text3 text-[12px]">Actions irréversibles liées à votre compte</p>
                                </div>
                            </div>
                            <div className="px-5 py-5">
                                <DeleteUser />
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
