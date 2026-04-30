export function RankBadge({ index }: { index: number }) {
    return (
        <div className="flex justify-center">
            <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${index === 0 && 'border border-amber-400/30 bg-amber-400/10 text-amber-400'} ${index === 1 && 'border border-gray-400/30 bg-gray-400/10 text-gray-500'} ${index === 2 && 'border border-orange-400/30 bg-orange-400/10 text-orange-400'} ${index > 2 && 'border border-gray-300/20 bg-gray-200/20 text-gray-500 dark:bg-white/5'} `}
            >
                {index + 1}
            </div>
        </div>
    );
}
