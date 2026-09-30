const block = "animate-pulse rounded bg-hover-bg";

// Mirrors ProductDetail's layout so the page doesn't jump when data arrives.
export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product">
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`h-16 w-16 shrink-0 rounded-xl ${block}`} />
            ))}
          </div>
          <div className={`aspect-square max-h-105 flex-1 rounded-2xl ${block}`} />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <div className={`h-6 w-14 rounded-full ${block}`} />
            <div className={`h-3 w-20 ${block}`} />
          </div>
          <div className={`mt-4 h-8 w-3/4 ${block}`} />
          <div className={`mt-3 h-4 w-40 ${block}`} />
          <div className="mt-5 flex items-baseline gap-3">
            <div className={`h-9 w-32 ${block}`} />
            <div className={`h-5 w-16 ${block}`} />
          </div>
          <div className="mt-7 flex items-center gap-4">
            <div className={`h-4 w-16 ${block}`} />
            <div className={`h-9 w-28 rounded-full ${block}`} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className={`h-11 w-36 rounded-full ${block}`} />
            <div className={`h-11 w-32 rounded-full ${block}`} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`h-3.5 w-32 ${block}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex gap-6 border-b border-border pb-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`h-4 w-16 ${block}`} />
          ))}
        </div>
        <div className="mt-4 flex gap-6 p-6">
          <div className="flex-1 space-y-2.5">
            <div className={`h-3.5 w-full ${block}`} />
            <div className={`h-3.5 w-11/12 ${block}`} />
            <div className={`h-3.5 w-4/5 ${block}`} />
            <div className={`h-3.5 w-2/3 ${block}`} />
          </div>
          <div className={`hidden h-32 flex-1 rounded-2xl sm:block ${block}`} />
        </div>
      </div>
      <span className="sr-only">Loading product…</span>
    </div>
  );
}
