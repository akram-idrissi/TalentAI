export default function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="text-ds-text3 inline-flex items-center gap-1 text-[12px]">
            {icon}
            {label}
        </span>
    );
}
