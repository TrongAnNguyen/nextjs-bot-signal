import { memo } from "react";
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
import { BacktestSeriesPoint } from "@/utils/backtest";
import { CustomTooltip } from "./CustomTooltip";
import { formatDate } from "./utils";

export const RSIChart = memo(
  ({ series }: { series: BacktestSeriesPoint[] }) => (
    <div className="bg-white p-8 rounded-3xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm overflow-hidden group">
      <h3 className="text-xs font-bold mb-8 flex items-center gap-2 text-zinc-400 tracking-widest uppercase">
        RELATIVE STRENGTH INDEX (RSI)
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
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
              domain={[0, 100]}
              orientation="right"
              fontSize={10}
              axisLine={false}
              tickLine={false}
              stroke="#94a3b8"
              ticks={[20, 40, 60, 80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              opacity={0.3}
              label={{
                value: "OVERBOUGHT",
                position: "insideLeft",
                fontSize: 8,
                fontWeight: "bold",
                fill: "#ef4444",
                offset: 10,
              }}
            />
            <ReferenceLine
              y={20}
              stroke="#10b981"
              strokeDasharray="4 4"
              opacity={0.3}
              label={{
                value: "OVERSOLD",
                position: "insideLeft",
                fontSize: 8,
                fontWeight: "bold",
                fill: "#10b981",
                offset: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#3b82f6"
              strokeWidth={2}
              activeDot={{ r: 5, strokeWidth: 0 }}
              dot={(props: any) => {
                const { cx, cy, payload, key } = props;
                const type = payload?.divergence?.type;
                if (type === "bullish") {
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#10b981"
                      stroke="#fff"
                      strokeWidth={2.5}
                    />
                  );
                }
                if (type === "bearish") {
                  return (
                    <circle
                      key={key}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#ef4444"
                      stroke="#fff"
                      strokeWidth={2.5}
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
  ),
);
RSIChart.displayName = "RSIChart";
