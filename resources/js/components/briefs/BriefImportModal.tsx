import { useI18n } from '@/hooks/useI18n';
import type { BriefFormData } from '@/types/brief';
import axios from 'axios';
import { FileText, Loader2, PenLine, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import BriefExtractionPreview from './BriefExtractionPreview';

interface Props {
    onExtracted: (data: Partial<BriefFormData> & { _confidence?: Record<string, 'high' | 'low'> }) => void;
    onManual: () => void;
    onClose: () => void;
}

export default function BriefImportModal({ onExtracted, onManual, onClose }: Props) {
    const { t } = useI18n();
    const [step, setStep] = useState<'choose' | 'upload'>('choose');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState<File | null>(null);
    const [preview, setPreview] = useState<(Partial<BriefFormData> & { _confidence?: Record<string, 'high' | 'low'> }) | null>(null);
    const [slow, setSlow] = useState(false);
    const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onDrop = useCallback((files: File[]) => {
        if (files[0]) {
            setPending(files[0]);
            setError(null);
        }
    }, []);

    const runExtraction = useCallback(async () => {
        if (!pending) return;
        setLoading(true);
        setError(null);
        setSlow(false);
        slowTimer.current = setTimeout(() => setSlow(true), 10_000);
        try {
            const form = new FormData();
            form.append('file', pending);
            const { data } = await axios.post(route('dashboard.briefs.import'), form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPreview(data);
        } catch (e) {
            const message =
                e instanceof Error && axios.isAxiosError(e)
                    ? (e.response?.data?.error ?? t('briefs.import_modal.extracting'))
                    : t('briefs.import_modal.extracting');
            setError(message);
        } finally {
            setLoading(false);
            setSlow(false);
            if (slowTimer.current) clearTimeout(slowTimer.current);
        }
    }, [pending, t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        disabled: loading,
    });

    return (
        <>
            {preview && (
                <BriefExtractionPreview
                    extracted={preview}
                    onConfirm={(data) => {
                        setPreview(null);
                        onExtracted(data);
                    }}
                    onDiscard={() => {
                        setPreview(null);
                        setPending(null);
                        setError(null);
                    }}
                />
            )}

            {!preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-ds-surface border-ds-border relative w-full max-w-md rounded-2xl border p-6 shadow-xl">
                        <button onClick={onClose} className="text-ds-text3 hover:text-ds-text absolute top-4 right-4 transition">
                            <X size={18} />
                        </button>

                        <h2 className="font-heading text-ds-text mb-1 text-[18px] font-bold">{t('briefs.import_modal.title')}</h2>
                        <p className="text-ds-text3 mb-6 text-[13px]">{t('briefs.import_modal.subtitle')}</p>

                        {step === 'choose' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="border-ds-border hover:border-ds-accent/50 hover:bg-ds-accent/5 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition"
                                >
                                    <div className="bg-ds-accent/10 flex h-10 w-10 items-center justify-center rounded-xl">
                                        <Upload className="text-ds-accent" size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-ds-text text-[13px] font-semibold">{t('briefs.import_modal.import_file')}</p>
                                        <p className="text-ds-text3 mt-0.5 text-[11px]">{t('briefs.import_modal.import_file_sub')}</p>
                                    </div>
                                </button>

                                <button
                                    onClick={onManual}
                                    className="border-ds-border hover:border-ds-border2 hover:bg-ds-bg3/40 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition"
                                >
                                    <div className="bg-ds-bg3 flex h-10 w-10 items-center justify-center rounded-xl">
                                        <PenLine className="text-ds-text2" size={20} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-ds-text text-[13px] font-semibold">{t('briefs.import_modal.manual')}</p>
                                        <p className="text-ds-text3 mt-0.5 text-[11px]">{t('briefs.import_modal.manual_sub')}</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {step === 'upload' && (
                            <div>
                                <div
                                    {...getRootProps()}
                                    className={[
                                        'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition',
                                        isDragActive ? 'border-ds-accent bg-ds-accent/5' : 'border-ds-border hover:border-ds-accent/40',
                                        loading ? 'cursor-not-allowed opacity-60' : '',
                                    ].join(' ')}
                                >
                                    <input {...getInputProps()} />
                                    {loading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="text-ds-accent animate-spin" size={32} />
                                            <p className="text-ds-text2 text-[13px]">{t('briefs.import_modal.extracting')}</p>
                                            {slow ? (
                                                <p className="text-ds-text3 animate-pulse text-[11px]">{t('briefs.import_modal.extracting_slow')}</p>
                                            ) : (
                                                <p className="text-ds-text3 text-[11px]">{t('briefs.import_modal.extracting_sub')}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-3">
                                            {pending ? (
                                                <>
                                                    <FileText className="text-ds-accent" size={32} />
                                                    <p className="text-ds-text text-[13px] font-medium">{pending.name}</p>
                                                    <p className="text-ds-text3 text-[11px]">{t('briefs.import_modal.file_hint')}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="text-ds-text3" size={32} />
                                                    <p className="text-ds-text2 text-[13px]">
                                                        {isDragActive ? t('briefs.import_modal.drop_active') : t('briefs.import_modal.drop_idle')}
                                                    </p>
                                                    <p className="text-ds-text3 text-[11px]">{t('briefs.import_modal.drop_formats')}</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-3 flex flex-col items-center gap-2">
                                        <p className="text-center text-[12px] text-red-500">{error}</p>
                                        <button
                                            onClick={() => {
                                                setError(null);
                                                setPending(null);
                                            }}
                                            className="text-ds-accent text-[12px] underline"
                                        >
                                            {t('briefs.import_modal.error_retry')}
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <button
                                        onClick={() => {
                                            setStep('choose');
                                            setError(null);
                                        }}
                                        className="text-ds-text3 hover:text-ds-text2 text-[12px] transition"
                                    >
                                        {t('briefs.import_modal.back')}
                                    </button>
                                    {pending ? (
                                        <button
                                            onClick={runExtraction}
                                            className="bg-ds-accent rounded-lg px-4 py-1.5 text-[12px] font-semibold text-white"
                                        >
                                            {t('briefs.import_modal.analyse')}
                                        </button>
                                    ) : (
                                        <button onClick={onManual} className="text-ds-text3 hover:text-ds-text2 text-[12px] transition">
                                            {t('briefs.import_modal.skip_manual')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
