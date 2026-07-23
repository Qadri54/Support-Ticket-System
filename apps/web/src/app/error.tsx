"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
      <h2 className="text-base font-semibold text-red-800 dark:text-red-300">
        Could not load tickets
      </h2>
      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
