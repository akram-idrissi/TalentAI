import { useI18n } from '@/hooks/useI18n';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AudioWaveform, CheckCheck, Copy, Download, RotateCcw, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// ── Types ────────────────────────────────────────────────────
type Status = 'idle' | 'uploading' | 'pending' | 'processing' | 'done' | 'failed';

const STATUS_LABEL: Record<Status, string> = {
    idle: '',
    uploading: 'Envoi du fichier…',
    pending: "En file d'attente — en attente d'un worker…",
    processing: 'Transcription en cours…',
    done: 'Terminé',
    failed: 'Échec de la transcription',
};

const PROGRESS_WIDTH: Partial<Record<Status, string>> = {
    uploading: '30%',
    pending: '55%',
    processing: '80%',
};

const ACCEPTED = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a'];
const ACCEPTED_EXT = '.mp3,.wav,.m4a';

// ── Status badge ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    done: { label: 'Terminé', className: 'bg-badge-active-bg text-badge-active-text border border-badge-active-text/20' },
    processing: { label: 'En cours', className: 'bg-ds-accent/10 text-ds-accent2 border border-ds-accent/20' },
    pending: { label: 'En attente', className: 'bg-badge-sourcing-bg text-badge-sourcing-text border border-badge-sourcing-text/20' },
    failed: { label: 'Échoué', className: 'bg-badge-interview-bg text-badge-interview-text border border-badge-interview-text/20' },
};

function TranscriptionStatusBadge({ status }: { status: Status }) {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return null;
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.className}`}>{cfg.label}</span>;
}

// ── Speaker turn parser ──────────────────────────────────────
type Turn = { speaker: string; text: string };

function parseTurns(transcript: string): Turn[] {
    const lines = transcript.split(/\n+/);
    const turns: Turn[] = [];
    for (const line of lines) {
        const match = line.match(/^(Interviewer|Candidate):\s*(.+)/);
        if (match) {
            turns.push({ speaker: match[1], text: match[2].trim() });
        } else if (turns.length > 0 && line.trim()) {
            turns[turns.length - 1].text += ' ' + line.trim();
        }
    }
    return turns.length > 0 ? turns : [{ speaker: 'Transcription', text: transcript }];
}

// ── Main page ────────────────────────────────────────────────
export default function Index() {
    const { t } = useI18n();

    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [diarizedTranscript, setDiarized] = useState<string>('');

    const inputRef = useRef<HTMLInputElement>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isWorking = ['uploading', 'pending', 'processing'].includes(status);

    // ── Polling ──────────────────────────────────────────────
    const startPolling = useCallback((id: number) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`/dashboard/transcriptions/${id}`);
                const data = await res.json();
                setStatus(data.status as Status);
                if (data.status === 'done') {
                    clearInterval(pollRef.current!);
                    setDiarized(data.diarized_transcript ?? '');
                } else if (data.status === 'failed') {
                    clearInterval(pollRef.current!);
                    setError(data.error ?? 'Erreur inconnue.');
                }
            } catch {
                clearInterval(pollRef.current!);
                setStatus('failed');
                setError('Connexion perdue lors du suivi.');
            }
        }, 3000);
    }, []);

    // ── Submit ───────────────────────────────────────────────
    const handleSubmit = useCallback(() => {
        if (!file) return;
        setStatus('uploading');
        setError('');
        router.post(
            '/dashboard/transcribe',
            { audio: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const id = (page.props as { id?: number }).id;
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
    }, [file, startPolling]);

    // ── File helpers ─────────────────────────────────────────
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

    // ── Copy / Download ──────────────────────────────────────
    const copyTranscript = async () => {
        await navigator.clipboard.writeText(diarizedTranscript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadTranscript = () => {
        const blob = new Blob([diarizedTranscript], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (file?.name.replace(/\.[^.]+$/, '') ?? 'transcript') + '.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Reset ────────────────────────────────────────────────
    const reset = () => {
        clearInterval(pollRef.current!);
        setFile(null);
        setStatus('idle');
        setDiarized('');
        setError('');
        if (inputRef.current) inputRef.current.value = '';
    };

    // ── Render ───────────────────────────────────────────────
    return (
        <>
            <Head title={t('transcriptions.index.title')} />
            <AppLayout>
                <div className="bg-ds-bg min-h-full px-6 py-8">
                    {/* Header — identical structure to Brief/Index */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[26px] font-bold">{t('transcriptions.index.title')}</h1>
                        <p className="text-ds-text2 mt-1 text-[14px]">{t('transcriptions.index.subtitle')}</p>
                    </div>

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
                            'border-ds-border bg-ds-surface mb-5 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 text-center transition-all select-none',
                            isWorking
                                ? 'cursor-not-allowed opacity-60'
                                : dragOver
                                  ? 'border-ds-accent bg-ds-accent/5 cursor-copy'
                                  : 'hover:border-ds-accent/50 cursor-pointer',
                        ].join(' ')}
                    >
                        <input ref={inputRef} type="file" accept={ACCEPTED_EXT} className="hidden" onChange={onInputChange} disabled={isWorking} />

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
                                    Déposez votre fichier audio ou <span className="text-ds-accent underline underline-offset-2">parcourez</span>
                                </p>
                                <p className="text-ds-text3 text-[12px]">MP3 · WAV · M4A — max 80 Mo</p>
                            </>
                        )}
                    </div>

                    {/* Error — matches Brief/Index inline error pattern */}
                    {error && (
                        <div className="border-ds-red/30 bg-ds-red/10 text-ds-red mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px]">
                            <span className="mt-0.5 shrink-0">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Toolbar — same button pattern as Brief/Index */}
                    <div className="mb-5 flex items-center gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!file || isWorking}
                            className="bg-ds-accent rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isWorking ? 'Transcription…' : t('transcriptions.index.actions.transcribe')}
                        </button>

                        {(file || diarizedTranscript) && (
                            <button
                                onClick={reset}
                                disabled={isWorking}
                                className="border-ds-border text-ds-text2 hover:bg-ds-surface hover:text-ds-text flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] transition disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <RotateCcw size={13} />
                                {t('transcriptions.index.actions.reset')}
                            </button>
                        )}
                    </div>

                    {/* Progress — card-style, consistent with ds-surface pattern */}
                    {isWorking && (
                        <div className="border-ds-border bg-ds-surface mb-5 rounded-xl border px-4 py-3">
                            <div className="mb-2 flex items-center justify-between text-[12px]">
                                <span className="text-ds-text2">{STATUS_LABEL[status]}</span>
                                <span className="text-ds-accent animate-pulse">●</span>
                            </div>
                            <div className="bg-ds-bg3 h-1 w-full overflow-hidden rounded-full">
                                <div
                                    className="bg-ds-accent h-full rounded-full transition-all duration-500"
                                    style={{ width: PROGRESS_WIDTH[status] ?? '0%' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Transcript result — same card shell as the briefs table */}
                    {status === 'done' && diarizedTranscript && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            {/* Card header */}
                            <div className="border-ds-border flex items-center justify-between border-b px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                    <AudioWaveform size={14} className="text-ds-text3" />
                                    <span className="text-ds-text3 text-[10px] font-semibold tracking-[0.8px] uppercase">Transcription</span>
                                    <TranscriptionStatusBadge status={status} />
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={copyTranscript}
                                        className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] transition"
                                        title="Copier"
                                    >
                                        {copied ? <CheckCheck size={12} className="text-badge-active-text" /> : <Copy size={12} />}
                                        {copied ? 'Copié !' : 'Copier'}
                                    </button>
                                    <button
                                        onClick={downloadTranscript}
                                        className="border-ds-border text-ds-text3 hover:border-ds-border2 hover:text-ds-text flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] transition"
                                        title="Télécharger"
                                    >
                                        <Download size={12} />
                                        .txt
                                    </button>
                                </div>
                            </div>

                            {/* Diarized turns */}
                            <div className="max-h-96 space-y-4 overflow-y-auto px-4 py-4">
                                {parseTurns(diarizedTranscript).map((turn, i) => (
                                    <div key={i} className="flex gap-3">
                                        <span
                                            className={[
                                                'mt-0.5 w-20 shrink-0 text-[11px] font-semibold tracking-[0.6px] uppercase',
                                                turn.speaker === 'Interviewer' ? 'text-ds-accent' : 'text-badge-active-text',
                                            ].join(' ')}
                                        >
                                            {turn.speaker}
                                        </span>
                                        <p className="text-ds-text2 text-[13px] leading-relaxed">{turn.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer word count */}
                            <div className="border-ds-border border-t px-4 py-2.5 text-right">
                                <span className="text-ds-text3 text-[12px]">{diarizedTranscript.split(/\s+/).filter(Boolean).length} mots</span>
                            </div>
                        </div>
                    )}

                    {/* Empty state (no transcript yet, not working) */}
                    {status === 'idle' && !file && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-16 text-center">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <span className="text-2xl">🎙️</span>
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">{t('transcriptions.index.empty.title')}</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">{t('transcriptions.index.empty.description')}</p>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
