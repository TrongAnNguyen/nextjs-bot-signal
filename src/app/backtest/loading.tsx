import { BarChart3, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6 animate-pulse">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
        </div>
        <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      </header>

      <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-zinc-200 border-dashed dark:bg-zinc-900 dark:border-zinc-800">
        <BarChart3
          size={48}
          className="text-zinc-100 mb-4 dark:text-zinc-800"
        />
        <Loader2 className="animate-spin text-blue-500 mb-2" />
        <p className="text-zinc-400 font-medium">Preparing Dashboard...</p>
      </div>
    </div>
  );
}
