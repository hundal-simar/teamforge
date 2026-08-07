export default function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-4 animate-pulse overflow-hidden w-full">
      {[1, 2, 3, 4].map((col) => (
        <div 
          key={col} 
          className="bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-3 flex-1 min-w-[280px] w-[280px] shrink-0 shadow-xl"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-1 mb-4">
            <div className="h-3 bg-zinc-700/50 rounded w-24"></div>
            <div className="h-4 bg-zinc-800/80 rounded-full w-8"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-2.5">
            {[1, 2, 3].map((card) => (
              <div 
                key={card} 
                className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl h-24 shadow-sm"
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}