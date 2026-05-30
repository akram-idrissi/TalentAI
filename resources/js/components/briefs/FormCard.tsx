interface FormCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function FormCard({ title, children, className = '' }: FormCardProps) {
    return (
        <div className={`border-ds-border bg-ds-surface rounded-xl border p-5 ${className}`}>
            <h2 className="font-heading text-ds-text mb-4 text-[15px] font-semibold">{title}</h2>
            {children}
        </div>
    );
}
