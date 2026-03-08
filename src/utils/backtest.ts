import { config } from "./config";
import { fetchCandles } from "./exchange";
import { calculateRSI } from "./indicators";
import { findPivotLows, findPivotHighs } from "./pivots";
import { detectBullishDivergence, detectBearishDivergence } from "./divergence";
import { DivergenceSignal, Pivot } from "./types";

export interface BacktestSeriesPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  rsi: number;
  divergence?: DivergenceSignal;
}

export interface BacktestResult {
  symbol: string;
  timeframe: string;
  series: BacktestSeriesPoint[];
  summary: {
    totalBullish: number;
    totalBearish: number;
    candleCount: number;
  };
}

/**
 * Finds all historical divergences for a set of pivots.
 */
function findAllDivergences(
  pivots: Pivot[],
  type: "bullish" | "bearish",
  symbol: string,
  timeframe: string,
): DivergenceSignal[] {
  const allSignals: DivergenceSignal[] = [];

  // We need at least 2 pivots to compare
  for (let i = 1; i < pivots.length; i++) {
    // We can reuse the detection logic by passing a slice of pivots up to the current one
    const pivotsUntilNow = pivots.slice(0, i + 1);

    let signal: DivergenceSignal | null = null;
    if (type === "bullish") {
      signal = detectBullishDivergence(
        pivotsUntilNow,
        symbol,
        timeframe,
        config.minPivotDistance,
        config.maxPivotDistance,
      );
    } else {
      signal = detectBearishDivergence(
        pivotsUntilNow,
        symbol,
        timeframe,
        config.minPivotDistance,
        config.maxPivotDistance,
      );
    }

    if (signal) {
      allSignals.push(signal);
    }
  }

  return allSignals;
}

export async function runBacktest(
  symbol: string,
  timeframe: string,
  limit: number = 500,
): Promise<BacktestResult> {
  // 1. Fetch candles
  const candles = await fetchCandles(symbol, timeframe, limit);

  // 2. Calculate RSI
  const closePrices = candles.map((c) => c.close);
  const rsiValues = calculateRSI(closePrices, config.rsiPeriod);

  // 3. Find Pivots
  const pivotLows = findPivotLows(candles, rsiValues, config.pivotStrength);
  const pivotHighs = findPivotHighs(candles, rsiValues, config.pivotStrength);

  // 4. Detect All Divergences
  const bullishSignals = findAllDivergences(
    pivotLows,
    "bullish",
    symbol,
    timeframe,
  );
  const bearishSignals = findAllDivergences(
    pivotHighs,
    "bearish",
    symbol,
    timeframe,
  );

  // 5. Build Series with Markers
  const series: BacktestSeriesPoint[] = candles.map((candle, i) => {
    const point: BacktestSeriesPoint = {
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      rsi: rsiValues[i],
    };

    // Check if there's a signal at this specific candle index
    const bull = bullishSignals.find((s) => s.currentPivot.index === i);
    const bear = bearishSignals.find((s) => s.currentPivot.index === i);

    if (bull) point.divergence = bull;
    if (bear) point.divergence = bear;

    return point;
  });

  return {
    symbol,
    timeframe,
    series,
    summary: {
      totalBullish: bullishSignals.length,
      totalBearish: bearishSignals.length,
      candleCount: candles.length,
    },
  };
}
