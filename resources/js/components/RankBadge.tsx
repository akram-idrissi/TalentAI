export function RankBadge({ index }: { index: number }) {
  return (
    <div className="flex justify-center">
      <div className={`
        w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold
        ${index === 0 && "bg-amber-400/10 text-amber-400 border border-amber-400/30"}
        ${index === 1 && "bg-gray-400/10 text-gray-500 border border-gray-400/30"}
        ${index === 2 && "bg-orange-400/10 text-orange-400 border border-orange-400/30"}
        ${index > 2 && "bg-gray-200/20 dark:bg-white/5 text-gray-500 border border-gray-300/20"}
      `}>
        {index + 1}
      </div>
    </div>
  );
}