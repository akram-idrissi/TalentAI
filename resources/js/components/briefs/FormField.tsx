interface FormFieldProps {
    label: string | React.ReactNode;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    hint?: string;
}

export function FormField({ label, required, error, children, hint }: FormFieldProps) {
    return (
        <div>
            <label className="text-ds-text2 mb-1.5 flex items-center gap-1 text-[12px] font-medium">
                <span>{label}</span>
                {required && <span className="text-ds-red">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-ds-text3 mt-1 text-right text-[11px]">{hint}</p>}
            {error && <p className="text-ds-red mt-1 text-[11px]">{error}</p>}
        </div>
    );
}

// Shared class helpers exported for use in pages
export const inputCls = (error?: string) =>
    `w-full rounded-lg border px-3 py-2 text-[13px] text-ds-text bg-ds-bg3 outline-none transition-all duration-150
    placeholder:text-ds-text3
    ${error ? 'border-ds-red focus:border-ds-red focus:ring-1 focus:ring-ds-red/30' : 'border-ds-border focus:border-ds-accent focus:ring-1 focus:ring-ds-accent/20 hover:border-ds-border2'}`;

export const textareaCls = (error?: string) => `${inputCls(error)} min-h-[90px] resize-y`;
