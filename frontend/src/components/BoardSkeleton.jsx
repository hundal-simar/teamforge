export default function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-4 animate-pulse">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-gray-100 rounded-lg p-3 flex-1 min-w-[260px]">
          <div className="h-4 bg-gray-300 rounded w-20 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((card) => (
              <div key={card} className="bg-white rounded-md h-16 shadow-sm"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}