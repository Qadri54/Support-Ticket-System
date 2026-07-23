export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-40 animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-20 animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-20 animate-pulse rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
      </div>
    </div>
  );
}
