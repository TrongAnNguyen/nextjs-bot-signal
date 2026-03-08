"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-200 dark:border-red-900/30">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        Something went wrong!
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-center max-w-md">
        An error occurred while loading the dashboard. This might be due to API
        connectivity or data issues.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
      >
        <RotateCcw size={16} /> Try again
      </button>
    </div>
  );
}
