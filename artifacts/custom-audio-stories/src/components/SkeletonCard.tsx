export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden bg-card/40 border border-border/20 animate-pulse ${className}`}
    >
      <div className="aspect-[3/4] bg-muted/30 relative">
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="h-2 w-12 bg-muted/40 rounded-full" />
          <div className="h-4 w-3/4 bg-muted/40 rounded-full" />
          <div className="h-3 w-1/2 bg-muted/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 5 }: { count?: number }) {
  return (
    <section className="py-6">
      <div className="px-4 md:px-8 mb-4 space-y-1.5">
        <div className="h-5 w-36 bg-muted/30 rounded-full animate-pulse" />
        <div className="h-3 w-24 bg-muted/20 rounded-full animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden pb-2 px-4 md:px-8">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard
            key={i}
            className="shrink-0 w-[160px] md:w-[220px]"
          />
        ))}
      </div>
    </section>
  );
}

export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
