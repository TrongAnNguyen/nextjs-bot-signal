import { memo } from "react";
import { BacktestSeriesPoint } from "@/utils/backtest";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatDate } from "./utils";

export const CustomTooltip = memo(({ active, payload }: any) => {
  if (!(active && payload && payload.length)) return null;

  const point = payload[0].payload as BacktestSeriesPoint;
  return (
    <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-lg text-sm dark:bg-zinc-900 dark:border-zinc-800">
      <p className="font-bold mb-1">{formatDate(point.timestamp)}</p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Price:{" "}
        <span className="text-black dark:text-white font-mono font-medium">
          ${point.close.toLocaleString()}
        </span>
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        RSI:{" "}
        <span className="text-blue-500 font-mono font-medium">
          {point.rsi != null ? point.rsi.toFixed(2) : "N/A"}
        </span>
      </p>
      {point.divergence ? (
        <div
          className={`mt-2 font-bold flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] tracking-wide w-fit ${
            point.divergence.type === "bullish"
              ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {point.divergence.type === "bullish" ? (
            <TrendingUp size={12} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={12} strokeWidth={2.5} />
          )}
          {point.divergence.type.toUpperCase()} DIVERGENCE
        </div>
      ) : null}
    </div>
  );
});
CustomTooltip.displayName = "CustomTooltip";
