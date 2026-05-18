export function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
    return (
        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
            <div className="border-ds-border flex items-center gap-2.5 border-b px-5 py-3.5">
                <Icon size={14} className="text-ds-accent shrink-0" />
                <h2 className="text-ds-text text-[13px] font-semibold tracking-wide uppercase">{title}</h2>
            </div>
            <div className="divide-ds-border divide-y">{children}</div>
        </div>
    );
}
