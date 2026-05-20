export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4 px-5 py-3.5">
            <span className="text-ds-text3 w-[160px] shrink-0 pt-0.5 text-[12px] font-medium">{label}</span>
            <span className="text-ds-text flex-1 text-[13px]">{children}</span>
        </div>
    );
}
