import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">Mot de passe</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">Utilisez un mot de passe long et aléatoire pour sécuriser votre compte.</p>
                    </div>

                    <div className="space-y-5">
                        {/* Password form card */}
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            {/* Card header */}
                            <div className="border-ds-border flex items-center gap-3 border-b px-5 py-4">
                                <div className="bg-ds-accent/10 flex h-7 w-7 items-center justify-center rounded-lg">
                                    <KeyRound size={14} className="text-ds-accent" />
                                </div>
                                <div>
                                    <p className="font-heading text-ds-text text-[14px] font-semibold">Modifier le mot de passe</p>
                                    <p className="text-ds-text3 text-[12px]">Renseignez votre mot de passe actuel pour en définir un nouveau</p>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={updatePassword} className="px-5 py-5">
                                <div className="grid gap-5">
                                    {/* Current password */}
                                    <div className="grid gap-1.5">
                                        <label
                                            htmlFor="current_password"
                                            className="text-ds-text2 text-[11px] font-semibold tracking-[0.8px] uppercase"
                                        >
                                            Mot de passe actuel
                                        </label>
                                        <div className="relative">
                                            <Lock size={13} className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
                                            <input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                type="password"
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                                            />
                                        </div>
                                        <InputError className="text-[12px]" message={errors.current_password} />
                                    </div>

                                    {/* Divider */}
                                    <div className="border-ds-border border-t" />

                                    {/* New password + confirm — side by side on sm+ */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {/* New password */}
                                        <div className="grid gap-1.5">
                                            <label htmlFor="password" className="text-ds-text2 text-[11px] font-semibold tracking-[0.8px] uppercase">
                                                Nouveau mot de passe
                                            </label>
                                            <div className="relative">
                                                <Lock
                                                    size={13}
                                                    className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                                />
                                                <input
                                                    id="password"
                                                    ref={passwordInput}
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                                                />
                                            </div>
                                            <InputError className="text-[12px]" message={errors.password} />
                                        </div>

                                        {/* Confirm password */}
                                        <div className="grid gap-1.5">
                                            <label
                                                htmlFor="password_confirmation"
                                                className="text-ds-text2 text-[11px] font-semibold tracking-[0.8px] uppercase"
                                            >
                                                Confirmer le mot de passe
                                            </label>
                                            <div className="relative">
                                                <Lock
                                                    size={13}
                                                    className="text-ds-text3 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                                                />
                                                <input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    className="border-ds-border bg-ds-bg3 text-ds-text placeholder:text-ds-text3 focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-lg border py-2.5 pr-4 pl-9 text-[13px] focus:ring-1 focus:outline-none"
                                                />
                                            </div>
                                            <InputError className="text-[12px]" message={errors.password_confirmation} />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="border-ds-border mt-5 flex items-center gap-3 border-t pt-5">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:opacity-60"
                                    >
                                        {processing ? 'Enregistrement…' : 'Mettre à jour'}
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
                                            Mot de passe mis à jour
                                        </span>
                                    </Transition>
                                </div>
                            </form>
                        </div>

                        {/* Tips card */}
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="border-ds-border flex items-center gap-3 border-b px-5 py-4">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
                                    <ShieldCheck size={14} className="text-green-600" />
                                </div>
                                <div>
                                    <p className="font-heading text-ds-text text-[14px] font-semibold">Bonnes pratiques</p>
                                    <p className="text-ds-text3 text-[12px]">Conseils pour un mot de passe robuste</p>
                                </div>
                            </div>
                            <ul className="divide-ds-border divide-y px-5 py-1">
                                {[
                                    'Au moins 12 caractères',
                                    'Mélange de majuscules, minuscules, chiffres et symboles',
                                    'Aucun mot du dictionnaire ni information personnelle',
                                    "Unique — non réutilisé sur d'autres services",
                                ].map((tip) => (
                                    <li key={tip} className="flex items-center gap-2.5 py-3">
                                        <CheckCircle2 size={13} className="shrink-0 text-green-500" />
                                        <span className="text-ds-text2 text-[13px]">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
