export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card-background">
      <div className="h-44 w-full animate-pulse bg-hover-bg sm:h-52" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-hover-bg" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-5 w-16 animate-pulse rounded bg-hover-bg" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-hover-bg" />
        </div>
      </div>
    </div>
  );
}
