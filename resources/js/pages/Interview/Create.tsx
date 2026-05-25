import { ACCEPTED, ACCEPTED_EXT, PLATFORMS, PROGRESS_WIDTH, selectStyles, STATUS_LABEL } from '@/constants/interviews';
import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { CreateInterviewProps, Option, Status } from '@/types/interviews';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCheck, ChevronLeft, Loader2, Mic, RotateCcw, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Select from 'react-select';
import { InterviewField } from './components/InterviewField';
import { InterviewRow } from './components/InterviewRow';

export default function CreateInterview({ candidates, briefs, interviews }: CreateInterviewProps) {
    const { t } = useI18n();

    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [selectedBrief, setSelectedBrief] = useState('');
    const [platform, setPlatform] = useState<string>('zoom');
    const [expectations, setExpectations] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string>('');

    const [dragOver, setDragOver] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isWorking = ['uploading', 'pending', 'processing'].includes(status);
    const canSubmit = !!file && !!selectedCandidate && !!selectedBrief && !isWorking;

    const startPolling = useCallback((id: number) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/dashboard/interviews/${id}/status`);
                const data = await res.json();

                if (data.status === 'done' && data.analysis_status === 'done') {
                    clearInterval(pollRef.current!);
                    setStatus('done');
                } else if (data.status === 'failed') {
                    clearInterval(pollRef.current!);
                    setStatus('failed');
                    setError(data.error ?? 'Erreur inconnue.');
                }
            } catch {
                clearInterval(pollRef.current!);
                setStatus('failed');
                setError('Connexion perdue lors du suivi.');
            }
        }, 3000);
    }, []);

    const handleSubmit = useCallback(() => {
        if (!canSubmit) return;
        setStatus('uploading');
        setError('');
        router.post(
            '/dashboard/interviews/upload',
            {
                audio: file,
                candidate_id: selectedCandidate,
                brief_id: selectedBrief,
                platform,
                expectations,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as { flash?: { interview_id?: number } };

                    const id = props.flash?.interview_id;
                    if (id) {
                        setStatus('pending');
                        startPolling(id);
                    } else {
                        setStatus('failed');
                        setError("Le serveur n'a pas retourné d'identifiant.");
                    }
                },
                onError: (errors) => {
                    setStatus('failed');
                    setError(errors.audio ?? errors.message ?? "Échec de l'envoi.");
                },
            },
        );
    }, [canSubmit, file, selectedCandidate, selectedBrief, platform, expectations, startPolling]);

    const pickFile = (f: File | null | undefined) => {
        if (!f) return;
        if (!ACCEPTED.includes(f.type)) {
            setError('Format non supporté. Utilisez MP3, WAV ou M4A.');
            return;
        }
        if (f.size > 80 * 1024 * 1024) {
            setError('Le fichier dépasse la limite de 80 Mo.');
            return;
        }
        setError('');
        setFile(f);
        setStatus('idle');
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => pickFile(e.target.files?.[0]);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!isWorking) pickFile(e.dataTransfer.files?.[0]);
    };

    const reset = () => {
        clearInterval(pollRef.current!);
        setFile(null);
        setStatus('idle');
        setError('');
        setSelectedCandidate('');
        setSelectedBrief('');
        setPlatform('zoom');
        setExpectations('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <>
            <Head title={t('interviews.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header */}
                    <div className="mb-6 flex items-start gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/dashboard/interviews')}
                            className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text mt-1 flex h-9 w-9 items-center justify-center rounded-lg border transition"
                            aria-label="Retour"
                        >
                            <ChevronLeft size={17} />
                        </button>

                        <div>
                            <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('interviews.index.title')}</h1>
                            <p className="text-ds-text2 mt-1 text-[14px]">{t('interviews.index.subtitle')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                        {/* ── Context selectors ── */}
                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                            <p className="font-heading text-ds-text mb-4 text-[14px] font-semibold">{t('interviews.index.form.title')}</p>
                            <div className="mb-4 flex flex-col gap-4">
                                <InterviewField label="Candidat">
                                    <Select<Option>
                                        value={
                                            candidates
                                                .map((c) => ({ value: c.id, label: c.full_name }))
                                                .find((option) => option.value === selectedCandidate) ?? null
                                        }
                                        onChange={(option) => setSelectedCandidate(option?.value ?? '')}
                                        placeholder={t('interviews.index.form.candidate_placeholder')}
                                        options={candidates.map((c) => ({ value: c.id, label: c.full_name }))}
                                        isDisabled={isWorking}
                                        styles={selectStyles}
                                    />
                                </InterviewField>

                                <InterviewField label="Brief de poste">
                                    <Select<Option>
                                        value={
                                            briefs.map((b) => ({ value: b.id, label: b.title })).find((option) => option.value === selectedBrief) ??
                                            null
                                        }
                                        onChange={(option) => setSelectedBrief(option?.value ?? '')}
                                        placeholder={t('interviews.index.form.brief_placeholder')}
                                        options={briefs.map((b) => ({ value: b.id, label: b.title }))}
                                        isDisabled={isWorking}
                                        styles={selectStyles}
                                    />
                                </InterviewField>

                                <InterviewField label="Plateforme">
                                    <Select
                                        value={
                                            PLATFORMS.map((p) => ({
                                                value: p,
                                                label: p,
                                            })).find((o) => o.value === platform) || null
                                        }
                                        onChange={(option) => setPlatform(option?.value ?? 'zoom')}
                                        options={PLATFORMS.map((p) => ({
                                            value: p,
                                            label: p,
                                        }))}
                                        isDisabled={isWorking}
                                        styles={selectStyles}
                                    />
                                </InterviewField>
                                <InterviewField label="Attentes spécifiques">
                                    <textarea
                                        value={expectations}
                                        onChange={(e) => setExpectations(e.target.value)}
                                        disabled={isWorking}
                                        placeholder="Ex: Nous cherchons quelqu'un capable de restructurer une équipe de 10 personnes, avec une expérience en SaaS B2B…"
                                        rows={4}
                                        className="border-ds-border bg-ds-bg text-ds-text focus:border-ds-accent placeholder:text-ds-text3 w-full resize-none rounded-lg border px-3 py-2.5 text-[13px] transition outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </InterviewField>
                                {/* Drop zone */}
                                <div
                                    onClick={() => !isWorking && inputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (!isWorking) setDragOver(true);
                                    }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={!isWorking ? onDrop : undefined}
                                    className={[
                                        'border-ds-border bg-ds-bg mb-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all select-none',
                                        isWorking
                                            ? 'cursor-not-allowed opacity-60'
                                            : dragOver
                                              ? 'border-ds-accent bg-ds-accent/5 cursor-copy'
                                              : 'hover:border-ds-accent/50 cursor-pointer',
                                    ].join(' ')}
                                >
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept={ACCEPTED_EXT}
                                        className="hidden"
                                        onChange={onInputChange}
                                        disabled={isWorking}
                                    />

                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${dragOver ? 'bg-ds-accent/20' : 'bg-ds-bg3'}`}
                                    >
                                        <Upload size={20} className={dragOver ? 'text-ds-accent' : 'text-ds-text3'} />
                                    </div>

                                    {file ? (
                                        <>
                                            <p className="font-heading text-ds-text max-w-xs truncate font-semibold">{file.name}</p>
                                            <p className="text-ds-text3 text-[12px]">{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-ds-text2 text-[14px]">
                                                Déposez votre fichier audio ou{' '}
                                                <span className="text-ds-accent underline underline-offset-2">parcourez</span>
                                            </p>
                                            <p className="text-ds-text3 text-[12px]">MP3 · WAV · M4A — max 80 Mo</p>
                                        </>
                                    )}
                                </div>
                                {/* Progress */}
                                {isWorking && (
                                    <div className="border-ds-border bg-ds-bg mb-4 rounded-xl border px-4 py-3">
                                        <div className="mb-2 flex items-center justify-between text-[12px]">
                                            <span className="text-ds-text2">{STATUS_LABEL[status]}</span>
                                            <span className="text-ds-accent animate-pulse">
                                                <Loader2 size={14} />
                                            </span>
                                        </div>
                                        <div className="bg-ds-bg3 h-1 w-full overflow-hidden rounded-full">
                                            <div
                                                className="bg-ds-accent h-full rounded-full transition-all duration-500"
                                                style={{ width: PROGRESS_WIDTH[status] ?? '0%' }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {status === 'done' && (
                                    <div className="border-ds-border bg-ds-surface flex items-center gap-3 rounded-xl border px-4 py-3">
                                        <div className="bg-badge-active-bg flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                                            <CheckCheck size={14} className="text-badge-active-text" />
                                        </div>
                                        <div>
                                            <p className="text-ds-text text-[13px] font-semibold">Transcription terminée</p>
                                            <p className="text-ds-text3 text-[12px]">
                                                Le fichier a bien été traité. Vous pouvez soumettre une nouvelle transcription.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!canSubmit}
                                        className="bg-ds-accent flex-1 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isWorking ? t('interviews.index.actions.uploading') : t('interviews.index.actions.upload')}
                                    </button>
                                    {file && (
                                        <button
                                            onClick={reset}
                                            disabled={isWorking}
                                            className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <RotateCcw size={13} />
                                            {t('interviews.index.actions.reset')}
                                        </button>
                                    )}
                                </div>
                                {/* Error */}
                                {error && (
                                    <div className="border-ds-red/30 bg-ds-red/10 text-ds-red mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]">
                                        <span className="mt-0.5 shrink-0">
                                            <AlertTriangle size={14} />
                                        </span>
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-ds-border bg-ds-surface rounded-xl border p-5">
                            <p className="font-heading text-ds-text mb-4 text-[14px] font-semibold">{t('interviews.index.history_title')}</p>
                            {interviews.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <span className="mb-3 text-3xl">
                                        <Mic size={14} className="text-ds-text3" />
                                    </span>
                                    <p className="text-ds-text text-[14px] font-semibold">{t('interviews.index.history_empty')}</p>
                                    <p className="text-ds-text2 mt-1 text-[13px]">{t('interviews.index.history_description')}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {interviews.map((interview) => (
                                        <InterviewRow key={interview.id} interview={interview} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
