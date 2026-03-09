import { memo } from "react";
import { Play, Loader2 } from "lucide-react";

interface BacktestFormProps {
  symbol: string;
  onSymbolChange: (val: string) => void;
  timeframe: string;
  onTimeframeChange: (val: string) => void;
  limit: number;
  onLimitChange: (val: number) => void;
  pivotStrength: number;
  onPivotStrengthChange: (val: number) => void;
  pivotRightStrength: number;
  onPivotRightStrengthChange: (val: number) => void;
  onRun: () => void;
  isPending: boolean;
}

export const BacktestForm = memo(
  ({
    symbol,
    onSymbolChange,
    timeframe,
    onTimeframeChange,
    limit,
    onLimitChange,
    pivotStrength,
    onPivotStrengthChange,
    pivotRightStrength,
    onPivotRightStrengthChange,
    onRun,
    isPending,
  }: BacktestFormProps) => (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label
          htmlFor="symbol"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Symbol
        </label>
        <input
          id="symbol"
          type="text"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          placeholder="BTC/USDT"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="timeframe"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Timeframe
        </label>
        <select
          id="timeframe"
          value={timeframe}
          onChange={(e) => onTimeframeChange(e.target.value)}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
        >
          {["5m", "15m", "30m", "1h", "4h", "1d"].map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label
          htmlFor="limit"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Candles
        </label>
        <input
          id="limit"
          type="number"
          value={limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          max={1000}
          min={100}
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="pivotStrength"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Left Pivot
        </label>
        <input
          id="pivotStrength"
          type="number"
          value={pivotStrength}
          onChange={(e) => onPivotStrengthChange(parseInt(e.target.value))}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          max={100}
          min={1}
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="pivotRightStrength"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Right Pivot
        </label>
        <input
          id="pivotRightStrength"
          type="number"
          value={pivotRightStrength}
          onChange={(e) => onPivotRightStrengthChange(parseInt(e.target.value))}
          className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
          max={100}
          min={1}
        />
      </div>
      <button
        onClick={onRun}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 disabled:scale-100 text-white rounded-lg px-6 py-2 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
      >
        {isPending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Play size={16} fill="currentColor" />
        )}
        Run Backtest
      </button>
    </div>
  ),
);
BacktestForm.displayName = "BacktestForm";
