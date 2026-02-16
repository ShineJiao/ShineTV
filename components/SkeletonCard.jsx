export function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      {/* Poster skeleton */}
      <div className="relative w-full aspect-2/3 overflow-hidden rounded-xl bg-gray-200 skeleton">
        <div className="absolute top-2 right-2 w-12 h-6 bg-gray-300 rounded-md skeleton"></div>
      </div>

      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded skeleton w-3/4"></div>
      </div>
    </div>
  );
}
