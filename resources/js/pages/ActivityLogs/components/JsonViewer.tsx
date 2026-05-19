export function JsonViewer({ data }: { data: Record<string, unknown> | null }) {
    if (!data || Object.keys(data).length === 0) return <span className="text-ds-text3">—</span>;
    return (
        <pre className="border-ds-border bg-ds-bg3 scrollbar-thin text-ds-text2 max-h-[280px] overflow-auto rounded-lg border p-3 text-[11px] leading-relaxed break-all whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}
