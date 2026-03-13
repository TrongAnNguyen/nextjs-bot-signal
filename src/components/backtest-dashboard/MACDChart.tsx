import { memo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BacktestSeriesPoint } from "@/utils/backtest";
import { CustomTooltip } from "./CustomTooltip";
import { formatDate } from "./utils";

export const MACDChart = memo(
  ({ series }: { series: BacktestSeriesPoint[] }) => {
    const chartData = series.map((p) => ({
      ...p,
      macd_val: p.macd?.MACD ?? null,
      signal_val: p.macd?.signal ?? null,
      histogram_val: p.macd?.histogram ?? null,
    }));

    return (
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden group">
        <h3 className="text-xs font-bold mb-8 flex items-center gap-2 text-zinc-400 tracking-widest uppercase">
          MACD (12, 26, 9)
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                strokeOpacity={0.08}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                fontSize={10}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
                stroke="#94a3b8"
              />
              <YAxis
                orientation="right"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                stroke="#94a3b8"
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="histogram_val"
                name="Histogram"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.histogram_val && entry.histogram_val > 0 ? "#10b981" : "#ef4444"}
                    opacity={0.3}
                  />
                ))}
              </Bar>

              <Line
                type="monotone"
                dataKey="macd_val"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                name="MACD"
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="signal_val"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
                name="Signal"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);
MACDChart.displayName = "MACDChart";
