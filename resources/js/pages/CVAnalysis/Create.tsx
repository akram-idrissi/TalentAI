import AppLayout from '@/layouts/app-layout';
import { useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Loader2, Trash2, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';
import ReactSelect, { SingleValue } from 'react-select';

type SelectOption = {
    value: string;
    label: string;
};

interface Brief {
    id: number | string;
    title: string;
}

interface AnalysisError {
    file: string;
    message: string;
}

interface FlashProps {
    analysis_errors?: Record<string, string | string[]> | AnalysisError[];
    success_count?: number;
    total?: number;
    success?: string;
}

type FormData = {
    brief_id: string;
    cvs: File[];
    [key: string]: string | File[];
};

export default function Index({ briefs }: { briefs: Brief[] }) {
    const { flash } = usePage<{ flash?: FlashProps }>().props;

    // =========================
    // FORM
    // =========================
    const { data, setData, post, processing } = useForm<FormData>({
        brief_id: '',
        cvs: [],
    });

    // =========================
    // CLIENT ERRORS
    // =========================
    const [clientErrors, setClientErrors] = useState<string[]>([]);

    // =========================
    // OPTIONS
    // =========================
    const briefOptions: SelectOption[] = briefs.map((brief: Brief) => ({
        value: String(brief.id),
        label: brief.title,
    }));

    const toOption = (val: string, opts: SelectOption[]): SelectOption | null => opts.find((o: SelectOption) => o.value === val) ?? null;

    // =========================
    // SUBMIT
    // =========================
    const submit = (): void => {
        const newErrors: string[] = [];

        if (!data.brief_id) {
            newErrors.push('Veuillez choisir un brief.');
        }

        if (data.cvs.length === 0) {
            newErrors.push('Veuillez sélectionner au moins un CV.');
        }

        if (data.cvs.length > 10) {
            newErrors.push('Maximum 10 CVs autorisés.');
        }

        data.cvs.forEach((file: File) => {
            const sizeMB = file.size / 1024 / 1024;

            if (sizeMB > 2) {
                newErrors.push(`${file.name} dépasse 2 MB.`);
            }

            if (file.type !== 'application/pdf') {
                newErrors.push(`${file.name} doit être un PDF.`);
            }
        });

        setClientErrors(newErrors);

        if (newErrors.length > 0) return;

        post(route('dashboard.cv-analysis.upload'), {
            forceFormData: true,
        });
    };

    // =========================
    // REMOVE FILE
    // =========================
    const removeFile = (index: number): void => {
        setData(
            'cvs',
            data.cvs.filter((_: File, i: number) => i !== index),
        );
    };

    // =========================
    // ANALYSIS ERRORS NORMALIZATION
    // =========================
    const rawErrors = flash?.analysis_errors ?? {};

    const analysisErrors: AnalysisError[] = (() => {
        if (Array.isArray(rawErrors)) {
            return rawErrors as AnalysisError[];
        }

        if (typeof rawErrors === 'object' && rawErrors !== null) {
            const typedRecord = rawErrors as Record<string, string | string[]>;
            return Object.entries(typedRecord).flatMap(([field, messages]): AnalysisError[] => {
                if (Array.isArray(messages)) {
                    return messages.map((msg: string) => ({
                        file: field,
                        message: msg,
                    }));
                }

                return [
                    {
                        file: field,
                        message: String(messages),
                    },
                ];
            });
        }

        return [];
    })();

    // =========================
    // STATS
    // =========================
    const successCount = flash?.success_count ?? 0;
    const total = flash?.total ?? 0;
    const failed = analysisErrors.length;
    const successMessage = flash?.success ?? null;

    const card = 'bg-ds-surface border border-ds-border rounded-2xl shadow-sm';

    return (
        <AppLayout>
            {/* LOADING */}
            {processing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-ds-surface flex flex-col items-center rounded-3xl p-8 shadow-2xl">
                        <Loader2 size={42} className="text-ds-accent animate-spin" />

                        <h2 className="text-ds-text mt-5 text-xl font-bold">AI Analysis Running</h2>

                        <p className="text-ds-text3 mt-2 text-center text-sm">Please wait while AI analyses CVs...</p>
                    </div>
                </div>
            )}

            <div className="bg-ds-bg min-h-screen p-4 md:p-8">
                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-ds-text text-3xl font-bold">CV Analysis</h1>

                    <p className="text-ds-text3 mt-1 text-sm">Upload and analyse CVs with AI</p>
                </div>

                {/* SUCCESS */}
                {successMessage && (
                    <div className="border-ds-green/20 bg-ds-green/10 mb-6 rounded-2xl border p-5">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-ds-green" />

                            <div>
                                <p className="text-ds-green font-semibold">Success</p>

                                <p className="text-ds-text text-sm">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATS */}
                {(total > 0 || successCount > 0 || failed > 0) && (
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Total</p>

                            <p className="text-ds-text text-3xl font-bold">{total}</p>
                        </div>

                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Success</p>

                            <p className="text-ds-green text-3xl font-bold">{successCount}</p>
                        </div>

                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Failed</p>

                            <p className="text-ds-red text-3xl font-bold">{failed}</p>
                        </div>
                    </div>
                )}

                {/* ERRORS */}
                {analysisErrors.length > 0 && (
                    <div className="border-ds-border bg-ds-surface mb-6 overflow-hidden rounded-2xl border">
                        <div className="border-ds-border flex items-center gap-2 border-b px-5 py-4">
                            <XCircle className="text-ds-red" size={18} />

                            <h3 className="text-ds-text font-semibold">CV Analysis Errors</h3>
                        </div>

                        <div className="max-h-[300px] space-y-3 overflow-auto p-4">
                            {analysisErrors.map((error: AnalysisError, index: number) => (
                                <div key={index} className="border-ds-border bg-ds-bg rounded-xl border p-4">
                                    <p className="text-ds-text text-sm font-medium break-all">{error.file}</p>

                                    <p className="text-ds-red mt-1 text-sm">{error.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {clientErrors.length > 0 && (
                    <div className="border-ds-border bg-ds-surface mb-6 overflow-hidden rounded-2xl border">
                        <div className="border-ds-border flex items-center gap-2 border-b px-5 py-4">
                            <XCircle className="text-ds-red" size={18} />

                            <h3 className="text-ds-text font-semibold">Errors</h3>
                        </div>

                        <div className="max-h-[300px] space-y-3 overflow-auto p-4">
                            {clientErrors.map((error: string, index: number) => (
                                <div key={index} className="border-ds-border bg-ds-bg rounded-xl border p-4">
                                    <p className="text-ds-red text-sm">{error}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FORM */}
                <div className="bg-ds-surface border-ds-border space-y-5 rounded-2xl border p-6">
                    {/* BRIEF */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Brief</label>

                        <ReactSelect<SelectOption>
                            classNamePrefix="rs"
                            options={briefOptions}
                            value={toOption(data.brief_id, briefOptions)}
                            onChange={(opt: SingleValue<SelectOption>) => setData('brief_id', opt?.value ?? '')}
                            placeholder="Choose brief"
                        />
                    </div>

                    {/* FILES */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Upload PDFs</label>

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-950">
                            <Upload size={34} className="mb-3 text-indigo-500" />

                            <p className="font-medium text-gray-700 dark:text-gray-200">Click to upload CVs</p>

                            <p className="mt-1 text-sm text-gray-500">PDF only • max 10 files • 2MB max</p>

                            <input
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('cvs', Array.from(e.target.files || []))}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* FILE LIST */}
                    {data.cvs.length > 0 && (
                        <div className="space-y-2">
                            {data.cvs.map((file: File, i: number) => (
                                <div key={i} className="border-ds-border flex justify-between rounded-xl border p-3">
                                    <p className="text-ds-text text-sm">{file.name}</p>

                                    <button type="button" onClick={() => removeFile(i)} className="text-ds-red">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BUTTON */}
                    <button
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="bg-ds-accent flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Launch Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
