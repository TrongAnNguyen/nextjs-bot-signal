"use client";

import { useState, useCallback, useTransition } from "react";
import { Loader2, BarChart3 } from "lucide-react";
import { BacktestResult } from "@/utils/backtest";

// Sub-components extracted for better maintainability and performance
import { BacktestHeader } from "./backtest-dashboard/BacktestHeader";
import { BacktestForm } from "./backtest-dashboard/BacktestForm";
import { BacktestSummary } from "./backtest-dashboard/BacktestSummary";
import { PriceChart } from "./backtest-dashboard/PriceChart";
import { RSIChart } from "./backtest-dashboard/RSIChart";
import { AlertCircle } from "./backtest-dashboard/utils";

interface BacktestDashboardProps {
  initialSymbol?: string;
}

/**
 * Main Component: BacktestDashboard
 *
 * Orquestrates the backtesting flow, handling state transitions and
 * data fetching between modular sub-components.
 */
export default function BacktestDashboard({
  initialSymbol = "BTC/USDT",
}: BacktestDashboardProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState("1h");
  const [limit, setLimit] = useState(500);
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBacktest = useCallback(() => {
    startTransition(async () => {
      setError(null);
      try {
        const params = new URLSearchParams({
          symbol,
          timeframe,
          limit: limit.toString(),
        });
        const resp = await fetch(`/api/backtest?${params.toString()}`);
        const json = await resp.json();

        if (json.error) throw new Error(json.error);

        setData(json);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }, [symbol, timeframe, limit]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-4xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <BacktestHeader />
        <BacktestForm
          symbol={symbol}
          onSymbolChange={setSymbol}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          limit={limit}
          onLimitChange={setLimit}
          onRun={fetchBacktest}
          isPending={isPending}
        />
      </header>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 dark:bg-red-900/10 dark:border-red-800/50 dark:text-red-400 flex items-center gap-3">
          <AlertCircle size={18} /> Error: {error}
        </div>
      ) : null}

      {data ? (
        <div
          className={`grid grid-cols-1 gap-8 transition-opacity duration-500 ${isPending ? "opacity-50" : "opacity-100"}`}
        >
          <BacktestSummary data={data} />
          <div className="space-y-8">
            <PriceChart series={data.series} />
            <RSIChart series={data.series} />
          </div>
        </div>
      ) : !isPending ? (
        <div className="h-[500px] flex flex-col items-center justify-center bg-white rounded-4xl border-2 border-zinc-100 border-dashed dark:bg-zinc-900 dark:border-zinc-800/50 group hover:border-blue-500/20 transition-colors duration-500">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
            <BarChart3 size={48} className="text-zinc-300 dark:text-zinc-700" />
          </div>
          <p className="text-zinc-900 dark:text-zinc-100 font-bold text-lg mb-1">
            Ready to analyze?
          </p>
          <p className="text-zinc-500 text-sm">
            Enter a symbol and click &quot;Run Backtest&quot; to visualize
            divergence signals.
          </p>
        </div>
      ) : (
        <div className="h-[500px] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
          <p className="text-zinc-500 font-medium animate-pulse text-sm">
            Fetching historical data...
          </p>
        </div>
      )}
    </div>
  );
}
