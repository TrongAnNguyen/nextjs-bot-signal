import { memo } from "react";
import { BarChart3 } from "lucide-react";

export const BacktestHeader = memo(() => (
  <div className="space-y-1">
    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
      <BarChart3 className="text-blue-500 shrink-0" /> RSI Divergence Backtester
    </h1>
    <p className="text-zinc-500 text-sm">
      Analyze historical signals and visualize confluences.
    </p>
  </div>
));
BacktestHeader.displayName = "BacktestHeader";
