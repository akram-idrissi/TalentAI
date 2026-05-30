export function InterviewField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-ds-text3 text-[11px] font-semibold tracking-[0.7px] uppercase">{label}</label>
            {children}
        </div>
    );
}
