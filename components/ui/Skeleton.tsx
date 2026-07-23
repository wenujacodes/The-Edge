export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary ${className}`} />;
}

export function FoodCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/1] rounded-2xl" />
      <div className="pt-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <div className="flex items-center justify-between mt-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[5/3] w-full rounded-2xl" />
      <div className="pt-3 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
