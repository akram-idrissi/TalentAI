export default function TagList({ items, dotClass }: { items: string[]; dotClass: string }) {
    return (
        <ul className="flex flex-col gap-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
                    <span className="text-ds-text2 text-[13px] leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    );
}
