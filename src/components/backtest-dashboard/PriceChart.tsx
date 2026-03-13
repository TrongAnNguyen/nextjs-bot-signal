import { memo } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
} from "recharts";
import { BacktestSeriesPoint } from "@/utils/backtest";
import { CustomTooltip } from "./CustomTooltip";
import { formatDate } from "./utils";

export const PriceChart = memo(
  ({ series }: { series: BacktestSeriesPoint[] }) => (
    <div className="bg-white p-8 rounded-3xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden group">
      <h3 className="text-xs font-bold mb-8 flex items-center gap-2 text-zinc-400 tracking-widest uppercase">
        PRICE & CONFLUENCE
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series}>
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
              domain={["auto", "auto"]}
              orientation="right"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              stroke="#94a3b8"
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="close"
              stroke="#1f2937"
              strokeWidth={2}
              dot={false}
              name="Price"
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="ema200"
              stroke="#2563eb"
              strokeWidth={1.5}
              strokeDasharray="6 6"
              dot={false}
              name="EMA 200"
              isAnimationActive={false}
            />

            <Scatter
              name="Bullish Divergence"
              dataKey={(point) => (point.divergence?.type === "bullish" ? point.low * 0.995 : null)}
              fill="#10b981"
            />

            <Scatter
              name="Bearish Divergence"
              dataKey={(point) => (point.divergence?.type === "bearish" ? point.high * 1.005 : null)}
              fill="#ef4444"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  ),
);
PriceChart.displayName = "PriceChart";
