"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Play,
  Loader2,
  BarChart3,
} from "lucide-react";
import { BacktestResult, BacktestSeriesPoint } from "@/utils/backtest";

interface BacktestDashboardProps {
  initialSymbol?: string;
}

export default function BacktestDashboard({
  initialSymbol = "BTC/USDT",
}: BacktestDashboardProps) {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState("1h");
  const [limit, setLimit] = useState(500);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBacktest = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `/api/backtest?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`,
      );
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as BacktestSeriesPoint;
      return (
        <div className="bg-white p-3 border border-zinc-200 shadow-lg rounded-lg text-sm dark:bg-zinc-900 dark:border-zinc-800">
          <p className="font-bold mb-1">{formatDate(point.timestamp)}</p>
          <p className="text-zinc-600 dark:text-zinc-400">
            Price:{" "}
            <span className="text-black dark:text-white font-mono">
              ${point.close.toLocaleString()}
            </span>
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            RSI:{" "}
            <span className="text-blue-500 font-mono">
              {point.rsi != null ? point.rsi.toFixed(2) : "N/A"}
            </span>
          </p>
          {point.divergence && (
            <div
              className={`mt-2 font-bold flex items-center gap-1 ${point.divergence.type === "bullish" ? "text-green-500" : "text-red-500"}`}
            >
              {point.divergence.type === "bullish" ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {point.divergence.type.toUpperCase()} DIVERGENCE
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart3 className="text-blue-500" /> RSI Divergence Backtester
          </h1>
          <p className="text-zinc-500 text-sm">
            Analyze historical signals and visualize confluences.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 uppercase">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              placeholder="BTC/USDT"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 uppercase">
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            >
              {["1m", "5m", "15m", "1h", "4h", "1d"].map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 uppercase">
              Candles
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              max={1000}
              min={100}
            />
          </div>
          <button
            onClick={fetchBacktest}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} fill="currentColor" />
            )}
            Run Backtest
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-zinc-400 uppercase font-medium">
                Symbol
              </p>
              <p className="text-lg font-bold">{data.symbol}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-zinc-400 uppercase font-medium">
                Total Signals
              </p>
              <p className="text-lg font-bold underline decoration-blue-500 decoration-2">
                {data.summary.totalBullish + data.summary.totalBearish}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-green-500/80 uppercase font-medium">
                Bullish
              </p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {data.summary.totalBullish}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-red-500/80 uppercase font-medium">
                Bearish
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {data.summary.totalBearish}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="space-y-6">
            {/* Price Chart */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2 text-zinc-400">
                PRICE ACTION & SIGNALS
              </h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      orientation="right"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      activeDot={{ r: 4 }}
                      dot={(props: any) => {
                        const { cx, cy, payload, key } = props;
                        if (payload?.divergence?.type === "bullish") {
                          return (
                            <circle
                              key={key}
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="#10b981"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        if (payload?.divergence?.type === "bearish") {
                          return (
                            <circle
                              key={key}
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="#ef4444"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <g key={key}></g>;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RSI Chart */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2 text-zinc-400">
                RELATIVE STRENGTH INDEX (RSI)
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatDate}
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      domain={[0, 100]}
                      orientation="right"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={80}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      opacity={0.5}
                      label={{
                        value: "80",
                        position: "insideLeft",
                        fontSize: 10,
                        fill: "#ef4444",
                      }}
                    />
                    <ReferenceLine
                      y={20}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      opacity={0.5}
                      label={{
                        value: "20",
                        position: "insideLeft",
                        fontSize: 10,
                        fill: "#10b981",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rsi"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      activeDot={{ r: 4 }}
                      dot={(props: any) => {
                        const { cx, cy, payload, key } = props;
                        if (payload?.divergence?.type === "bullish") {
                          return (
                            <circle
                              key={key}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="#10b981"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        if (payload?.divergence?.type === "bearish") {
                          return (
                            <circle
                              key={key}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill="#ef4444"
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <g key={key}></g>;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-zinc-200 border-dashed dark:bg-zinc-900 dark:border-zinc-800">
          <BarChart3
            size={48}
            className="text-zinc-200 mb-4 dark:text-zinc-700"
          />
          <p className="text-zinc-500 font-medium">
            Enter a symbol and click &quot;Run Backtest&quot; to begin.
          </p>
        </div>
      )}
    </div>
  );
}
