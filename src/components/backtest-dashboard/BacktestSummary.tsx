import { memo } from "react";
import { BacktestResult } from "@/utils/backtest";

export const BacktestSummary = memo(({ data }: { data: BacktestResult }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      {
        label: "Symbol",
        value: data.symbol,
        color: "text-zinc-900 dark:text-zinc-100",
      },
      {
        label: "Total Signals",
        value: data.summary.totalBullish + data.summary.totalBearish,
        color: "text-blue-600 dark:text-blue-400",
        decoration: "underline decoration-blue-500/30 decoration-2",
      },
      {
        label: "Bullish",
        value: data.summary.totalBullish,
        color: "text-green-600 dark:text-green-400",
      },
      {
        label: "Bearish",
        value: data.summary.totalBearish,
        color: "text-red-600 dark:text-red-400",
      },
    ].map((item, idx) => (
      <div
        key={idx}
        className="bg-white p-5 rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm transition-transform hover:scale-[1.02]"
      >
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1.5 shrink-0">
          {item.label}
        </p>
        <p
          className={`text-xl font-black ${item.color} ${item.decoration || ""}`}
        >
          {item.value}
        </p>
      </div>
    ))}
  </div>
));
BacktestSummary.displayName = "BacktestSummary";
