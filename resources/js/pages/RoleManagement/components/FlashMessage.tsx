import { AlertCircle, CheckCircle2, X } from 'lucide-react';
export function FlashMessage({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
    const isSuccess = type === 'success';
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-sm ${
                isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-red-200 bg-red-50 text-red-900 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200'
            }`}
            role="alert"
        >
            <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isSuccess
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                }`}
            >
                <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold">{message}</p>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                aria-label="Dismiss"
            >
                <X size={15} />
            </button>
        </div>
    );
}
