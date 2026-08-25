export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`skeleton ${className}`} />;
}

export function ProductSkeleton() {
  return (
    <div className="card space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
