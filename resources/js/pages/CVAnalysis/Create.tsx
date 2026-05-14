import AppLayout from "@/layouts/app-layout";
import { useForm, usePage } from "@inertiajs/react";
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    FileText,
    Loader2,
    Trash2,
    Upload,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import ReactSelect from "react-select";

type SelectOption = {
    value: string;
    label: string;
};

export default function Index({ briefs }: any) {

    const { flash, errors } = usePage().props as any;

    // =========================
    // FORM
    // =========================
    const { data, setData, post, processing } = useForm({
        brief_id: "",
        cvs: [] as File[],
    });

    // =========================
    // CLIENT ERRORS
    // =========================
    const [clientErrors, setClientErrors] = useState<string[]>([]);

    // =========================
    // OPTIONS
    // =========================
    const briefOptions: SelectOption[] = briefs.map((brief: any) => ({
        value: String(brief.id),
        label: brief.title,
    }));

    const toOption = (val: string, opts: SelectOption[]) =>
        opts.find((o) => o.value === val) ?? null;

    // =========================
    // SUBMIT
    // =========================
    const submit = () => {

        const newErrors: string[] = [];

        if (!data.brief_id) newErrors.push("Veuillez choisir un brief.");
        if (data.cvs.length === 0) newErrors.push("Veuillez sélectionner au moins un CV.");
        if (data.cvs.length > 10) newErrors.push("Maximum 10 CVs autorisés.");

        data.cvs.forEach((file) => {
            const sizeMB = file.size / 1024 / 1024;

            if (sizeMB > 2) newErrors.push(`${file.name} dépasse 2 MB.`);
            if (file.type !== "application/pdf") newErrors.push(`${file.name} doit être un PDF.`);
        });

        setClientErrors(newErrors);

        if (newErrors.length > 0) return;

        post(route("dashboard.cv-analysis.upload"), {
            forceFormData: true,
        });
    };

    // =========================
    // REMOVE FILE
    // =========================
    const removeFile = (index: number) => {
        setData("cvs", data.cvs.filter((_, i) => i !== index));
    };

    // =========================
    // ANALYSIS ERRORS NORMALIZATION
    // =========================
    const rawErrors = flash?.analysis_errors ?? {};

    const analysisErrors = (() => {

        if (Array.isArray(rawErrors)) return rawErrors;

        if (typeof rawErrors === "object" && rawErrors !== null) {
            return Object.entries(rawErrors).flatMap(([field, messages]: any) => {

                if (Array.isArray(messages)) {
                    return messages.map((msg: string) => ({
                        file: field,
                        message: msg,
                    }));
                }

                return [{
                    file: field,
                    message: String(messages),
                }];
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

    const card =
        "bg-ds-surface border border-ds-border rounded-2xl shadow-sm";

    return (
        <AppLayout>

            {/* LOADING */}
            {processing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-ds-surface rounded-3xl p-8 shadow-2xl flex flex-col items-center">
                        <Loader2 size={42} className="animate-spin text-ds-accent" />
                        <h2 className="mt-5 text-xl font-bold text-ds-text">
                            AI Analysis Running
                        </h2>
                        <p className="mt-2 text-sm text-ds-text3 text-center">
                            Please wait while AI analyses CVs...
                        </p>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-ds-bg p-4 md:p-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-ds-text">
                        CV Analysis
                    </h1>
                    <p className="text-sm text-ds-text3 mt-1">
                        Upload and analyse CVs with AI
                    </p>
                </div>

                {/* SUCCESS */}
                {successMessage && (
                    <div className="mb-6 rounded-2xl border border-ds-green/20 bg-ds-green/10 p-5">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-ds-green" />
                            <div>
                                <p className="font-semibold text-ds-green">
                                    Success
                                </p>
                                <p className="text-sm text-ds-text">
                                    {successMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STATS */}
                {(total > 0 || successCount > 0 || failed > 0) && (
                    <div className="grid md:grid-cols-3 gap-4 mb-6">

                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Total</p>
                            <p className="text-3xl font-bold text-ds-text">{total}</p>
                        </div>

                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Success</p>
                            <p className="text-3xl font-bold text-ds-green">{successCount}</p>
                        </div>

                        <div className={`${card} p-5`}>
                            <p className="text-ds-text3 text-sm">Failed</p>
                            <p className="text-3xl font-bold text-ds-red">{failed}</p>
                        </div>

                    </div>
                )}

                {/* ERRORS */}
                {analysisErrors.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-ds-border bg-ds-surface overflow-hidden">

                        <div className="px-5 py-4 border-b border-ds-border flex items-center gap-2">
                            <XCircle className="text-ds-red" size={18} />
                            <h3 className="font-semibold text-ds-text">
                                CV Analysis Errors
                            </h3>
                        </div>

                        <div className="p-4 space-y-3 max-h-[300px] overflow-auto">

                            {analysisErrors.map((error: any, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-ds-border bg-ds-bg p-4"
                                >
                                    <p className="text-sm font-medium text-ds-text break-all">
                                        {error.file}
                                    </p>
                                    <p className="text-sm text-ds-red mt-1">
                                        {error.message}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                )}

                {/* FORM */}
                <div className="bg-ds-surface border border-ds-border rounded-2xl p-6 space-y-5">

                    {/* BRIEF */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Brief
                        </label> 
                        <ReactSelect
                            classNamePrefix="rs"
                            options={briefOptions}
                            value={toOption(data.brief_id, briefOptions)}
                            onChange={(opt) =>
                                setData("brief_id", opt?.value ?? "")
                            }
                            placeholder="Choose brief"
                        />
                    </div>

                    {/* FILES */}
                    <div> 
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             Upload PDFs 
                             </label> 
                             <label className="border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition bg-gray-50 dark:bg-neutral-950">
                                 <Upload size={34} className="text-indigo-500 mb-3" /> 
                                 <p className="font-medium text-gray-700 dark:text-gray-200"> 
                                    Click to upload CVs 
                                    </p> 
                                    <p className="text-sm text-gray-500 mt-1"> 
                                        PDF only • max 10 files • 2MB max </p> 
                                        <input type="file" multiple accept=".pdf" 
                                        onChange={(e) => setData( "cvs", Array.from( e.target .files || [] ) ) } 
                                        className="hidden" />
                                         </label>
                                         </div>

                    {/* FILE LIST */}
                    {data.cvs.length > 0 && (
                        <div className="space-y-2">
                            {data.cvs.map((file, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between p-3 border border-ds-border rounded-xl"
                                >
                                    <p className="text-sm text-ds-text">
                                        {file.name}
                                    </p>

                                    <button
                                        onClick={() => removeFile(i)}
                                        className="text-ds-red"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* BUTTON */}
                    <button
                        onClick={submit}
                        disabled={processing}
                        className="w-full bg-ds-accent text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
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