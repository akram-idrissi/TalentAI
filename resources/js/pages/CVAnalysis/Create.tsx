import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronRight, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactSelect from 'react-select';

interface SelectOption {
    value: string;
    label: string;
}

interface Brief {
    id: number;
    title: string;
}

interface Candidate {
    full_name: string;
}

interface BriefRef {
    title: string;
}

interface RecentAnalysis {
    id: number;
    score_global: number | null;
    candidate: Candidate | null;
    brief: BriefRef | null;
}

interface FlashProps {
    analysis_errors?: Array<{ file: string; message: string }> | Record<string, string | string[]>;
    success?: string | null;
}

interface PageProps {
    flash: FlashProps;
}

const SCORE_COLORS = [
    'from-[#6C63FF] to-[#8B5CF6]',
    'from-[#38BDF8] to-[#0EA5E9]',
    'from-[#34D399] to-[#10B981]',
    'from-[#F59E0B] to-[#F97316]',
    'from-[#F87171] to-[#EF4444]',
];

function initials(name: string): string {
    return (
        name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || '?'
    );
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-[#34D399]';
    if (score >= 60) return 'text-[#F59E0B]';
    return 'text-[#F87171]';
}

function friendlyError(message: string): string {
    if (!message) return "Une erreur s'est produite lors de l'analyse.";

    const lower = message.toLowerCase();

    if (lower.includes('429') || lower.includes('rate limit') || lower.includes('quota'))
        return "Le service d'analyse est temporairement surchargé. Veuillez réessayer dans quelques instants.";

    if (lower.includes('pdf') || lower.includes('parser') || lower.includes('parse'))
        return "Impossible de lire ce fichier PDF. Vérifiez qu'il n'est pas corrompu ou protégé par un mot de passe.";

    if (lower.includes('timeout') || lower.includes('timed out'))
        return "L'analyse a pris trop de temps. Veuillez réessayer avec un fichier plus léger.";

    if (lower.includes('not found') || lower.includes('404')) return 'Fichier introuvable. Veuillez le téléverser à nouveau.';

    if (lower.includes('500') || lower.includes('server')) return "Une erreur interne s'est produite. Notre équipe a été notifiée.";

    if (lower.includes('gemini') || lower.includes('api'))
        return "Le service d'intelligence artificielle est momentanément indisponible. Réessayez dans quelques instants.";

    return "Une erreur s'est produite lors de l'analyse de ce CV. Veuillez réessayer.";
}

function normalizeErrors(raw: FlashProps['analysis_errors']): Array<{ file: string; message: string }> {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;

    return Object.entries(raw).flatMap(([field, messages]) =>
        Array.isArray(messages) ? messages.map((msg) => ({ file: field, message: msg })) : [{ file: field, message: String(messages) }],
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
    briefs: Brief[];
    recent_analyses: RecentAnalysis[];
}

export default function CVAnalysisCreate({ briefs, recent_analyses }: Props) {
    const { flash } = usePage().props as unknown as PageProps;

    const { data, setData, post, processing } = useForm({
        brief_id: '',
        cvs: [] as File[],
    });

    const [clientErrors, setClientErrors] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const errorRef = useRef<HTMLDivElement>(null);

    const briefOptions: SelectOption[] = briefs.map((b) => ({
        value: String(b.id),
        label: b.title,
    }));

    const toOption = (val: string, opts: SelectOption[]): SelectOption | null => opts.find((o) => o.value === val) ?? null;

    const addFiles = (files: File[]): void => {
        const merged = [...data.cvs, ...files];
        setData(
            'cvs',
            merged.filter((f, i, arr) => arr.findIndex((x) => x.name === f.name) === i),
        );
    };

    const removeFile = (index: number): void =>
        setData(
            'cvs',
            data.cvs.filter((_, i) => i !== index),
        );

    const submit = (): void => {
        const errs: string[] = [];
        if (!data.brief_id) errs.push('Veuillez choisir un brief.');
        if (data.cvs.length === 0) errs.push('Veuillez sélectionner au moins un CV.');
        if (data.cvs.length > 10) errs.push('Maximum 10 CVs autorisés.');
        data.cvs.forEach((f) => {
            if (f.size / 1024 / 1024 > 2) errs.push(`${f.name} dépasse 2 MB.`);
            if (f.type !== 'application/pdf') errs.push(`${f.name} doit être un PDF.`);
        });
        setClientErrors(errs);
        if (errs.length > 0) return;
        post(route('dashboard.cv-analysis.upload'), { forceFormData: true });
    };

    const analysisErrors = normalizeErrors(flash?.analysis_errors);
    const successMessage = flash?.success ?? null;

    useEffect(() => {
        if ((analysisErrors.length > 0 || clientErrors.length > 0) && errorRef.current) {
            errorRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [analysisErrors.length, clientErrors.length]);

    return (
        <AppLayout>
            {/* LOADING OVERLAY */}
            {processing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-ds-surface border-ds-border flex flex-col items-center gap-4 rounded-3xl border p-10 shadow-2xl">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6C63FF]/20">
                            <Loader2 size={32} className="animate-spin text-[#6C63FF]" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-ds-text text-lg font-bold">Analyse en cours</h2>
                            <p className="text-ds-text3 mt-1 text-sm">L'IA analyse vos CVs, veuillez patienter…</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-ds-bg text-ds-text min-h-screen p-6">
                {/* HEADER */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-ds-text3 text-xs">Recrutement › Analyse CV</p>
                        <h1 className="mt-1 text-3xl font-bold">Importer des CVs</h1>
                        <p className="text-ds-text2 mt-1 text-sm">Téléversez vos CVs · L'IA les analyse automatiquement</p>
                    </div>
                    <button
                        onClick={() => router.get(route('dashboard.cv-analysis.index'))}
                        className="border-ds-border bg-ds-surface text-ds-text flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition hover:border-[#6C63FF]/50"
                    >
                        Voir les analyses
                        <ChevronRight size={15} />
                    </button>
                </div>

                {/* SUCCESS BANNER */}
                {successMessage && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#34D399]/25 bg-[#34D399]/10 p-5">
                        <CheckCircle2 className="mt-0.5 shrink-0 text-[#34D399]" size={18} />
                        <div>
                            <p className="font-semibold text-[#34D399]">Analyse terminée</p>
                            <p className="text-ds-text2 mt-0.5 text-sm">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* ANALYSIS ERRORS */}
                {analysisErrors.length > 0 && (
                    <div ref={errorRef} className="mb-6 overflow-hidden rounded-2xl border border-[#F87171]/25 bg-[#F87171]/5">
                        <div className="flex items-center gap-2 border-b border-[#F87171]/20 px-5 py-4">
                            <AlertCircle size={16} className="text-[#F87171]" />
                            <h3 className="text-sm font-semibold text-[#F87171]">
                                {analysisErrors.length} fichier
                                {analysisErrors.length > 1 ? 's' : ''} n'ont pas pu être analysés
                            </h3>
                        </div>
                        <div className="space-y-2 p-4">
                            {analysisErrors.map((err, i) => (
                                <div key={i} className="border-ds-border bg-ds-surface flex items-start gap-3 rounded-xl border p-4">
                                    <FileText size={16} className="text-ds-text3 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-ds-text truncate text-sm font-medium">{err.file}</p>
                                        <p className="mt-0.5 text-sm text-[#F87171]">{friendlyError(err.message)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CLIENT ERRORS */}
                {clientErrors.length > 0 && (
                    <div
                        ref={analysisErrors.length === 0 ? errorRef : undefined}
                        className="mb-6 rounded-2xl border border-[#F87171]/25 bg-[#F87171]/5 p-5"
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <AlertCircle size={16} className="text-[#F87171]" />
                            <h3 className="text-sm font-semibold text-[#F87171]">Veuillez corriger les erreurs suivantes</h3>
                        </div>
                        <ul className="space-y-1">
                            {clientErrors.map((err, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-[#F87171]">
                                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#F87171]" />
                                    {err}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* MAIN LAYOUT */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    {/* FORM */}
                    <div className="border-ds-border bg-ds-surface space-y-6 rounded-3xl border p-7 lg:col-span-3">
                        <div>
                            <h2 className="text-ds-text mb-1 text-base font-bold">Importer un CV</h2>
                            <p className="text-ds-text3 text-sm">Sélectionnez un brief et téléversez les CVs à analyser</p>
                        </div>

                        {/* BRIEF SELECT */}
                        <div>
                            <label className="text-ds-text2 mb-2 block text-sm font-medium">Brief associé</label>
                            <ReactSelect
                                classNamePrefix="rs"
                                options={briefOptions}
                                value={toOption(data.brief_id, briefOptions)}
                                onChange={(opt) => setData('brief_id', opt?.value ?? '')}
                                placeholder="Choisir un brief…"
                            />
                        </div>

                        {/* DROP ZONE */}
                        <div>
                            <label className="text-ds-text2 mb-2 block text-sm font-medium">Fichiers PDF</label>
                            <label
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOver(false);
                                    addFiles(Array.from(e.dataTransfer.files));
                                }}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all ${
                                    dragOver
                                        ? 'border-[#6C63FF] bg-[#6C63FF]/10'
                                        : 'border-ds-border bg-ds-bg hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/5'
                                }`}
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6C63FF]/15">
                                    <FileText size={26} className="text-[#6C63FF]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-ds-text text-sm font-semibold">Déposez les CVs ici</p>
                                    <p className="text-ds-text3 mt-0.5 text-xs">PDF uniquement · Max 10 fichiers · 2 MB max</p>
                                </div>
                                <span className="border-ds-border bg-ds-surface text-ds-text2 mt-1 flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium transition hover:border-[#6C63FF]/50">
                                    <Plus size={13} />
                                    Parcourir
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => addFiles(Array.from(e.target.files || []))}
                                />
                            </label>
                        </div>

                        {/* FILE LIST */}
                        {data.cvs.length > 0 && (
                            <div className="space-y-2">
                                {data.cvs.map((file, i) => (
                                    <div key={i} className="border-ds-border bg-ds-bg flex items-center gap-3 rounded-xl border px-4 py-3">
                                        <FileText size={15} className="shrink-0 text-[#6C63FF]" />
                                        <p className="text-ds-text flex-1 truncate text-sm">{file.name}</p>
                                        <span className="text-ds-text3 shrink-0 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="text-ds-text3 shrink-0 transition hover:text-[#F87171]"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SUBMIT */}
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6C63FF] py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Analyse en cours…
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Analyser avec l'IA →
                                </>
                            )}
                        </button>
                    </div>

                    {/* RECENT */}
                    <div className="space-y-4 lg:col-span-2">
                        <h2 className="text-ds-text3 px-1 text-sm font-semibold tracking-wider uppercase">Analyses récentes</h2>

                        {recent_analyses.length === 0 ? (
                            <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-3xl border py-16 text-center">
                                <FileText size={36} className="text-ds-text3 mb-3" />
                                <p className="text-ds-text3 text-sm">Aucune analyse récente</p>
                            </div>
                        ) : (
                            recent_analyses.map((item, index) => (
                                <div
                                    key={item.id}
                                    onClick={() => router.get(route('dashboard.cv-analysis.index'))}
                                    className="border-ds-border bg-ds-surface hover:bg-ds-bg cursor-pointer rounded-2xl border p-5 transition hover:border-[#6C63FF]/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${SCORE_COLORS[index % SCORE_COLORS.length]}`}
                                        >
                                            {initials(item.candidate?.full_name ?? '')}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-ds-text truncate text-sm font-semibold">{item.candidate?.full_name}</p>
                                            <p className="text-ds-text3 truncate text-xs">{item.brief?.title}</p>
                                        </div>

                                        {item.score_global != null ? (
                                            <p className={`shrink-0 text-xl font-extrabold ${getScoreColor(item.score_global)}`}>
                                                {item.score_global}
                                                <span className="text-ds-text3 text-xs font-normal">/100</span>
                                            </p>
                                        ) : (
                                            <span className="shrink-0 rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-semibold text-[#F59E0B]">
                                                En cours
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
