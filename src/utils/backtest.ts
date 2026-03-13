import { config } from "./config";
import { fetchCandles } from "./exchange";
import { calculateRSI, calculateEMA, calculateMACD } from "./indicators";
import { findPivotLows, findPivotHighs } from "./pivots";
import { 
  detectBullishDivergence, 
  detectBearishDivergence,
  detectHiddenBullishDivergence,
  detectHiddenBearishDivergence 
} from "./divergence";
import { DivergenceSignal, Pivot, MACDResult } from "./types";

export interface BacktestSeriesPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  rsi: number;
  ema200?: number;
  macd?: MACDResult;
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

  for (let i = 1; i < pivots.length; i++) {
    const pivotsUntilNow = pivots.slice(0, i + 1);

    let signals: (DivergenceSignal | null)[] = [];
    if (type === "bullish") {
      signals = [
        detectBullishDivergence(pivotsUntilNow, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance),
        detectHiddenBullishDivergence(pivotsUntilNow, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance)
      ];
    } else {
      signals = [
        detectBearishDivergence(pivotsUntilNow, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance),
        detectHiddenBearishDivergence(pivotsUntilNow, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance)
      ];
    }

    for (const signal of signals) {
      if (signal) allSignals.push(signal);
    }
  }

  return allSignals;
}

export async function runBacktest(
  symbol: string,
  timeframe: string,
  limit: number = 500,
  pivotStrength: number = config.pivotStrength,
  pivotRightStrength: number = config.pivotRightStrength,
): Promise<BacktestResult> {
  const candles = await fetchCandles(symbol, timeframe, limit);

  const closePrices = candles.map((c) => c.close);
  const rsiValues = calculateRSI(closePrices, config.rsiPeriod);
  const ema200Values = calculateEMA(closePrices, config.emaPeriod);
  const macdValues = calculateMACD(closePrices, config.macdFast, config.macdSlow, config.macdSignal);

  const pivotLows = findPivotLows(candles, rsiValues, pivotStrength, pivotRightStrength);
  const pivotHighs = findPivotHighs(candles, rsiValues, pivotStrength, pivotRightStrength);

  const bullishSignals = findAllDivergences(pivotLows, "bullish", symbol, timeframe);
  const bearishSignals = findAllDivergences(pivotHighs, "bearish", symbol, timeframe);

  const series: BacktestSeriesPoint[] = candles.map((candle, i) => {
    const point: BacktestSeriesPoint = {
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      rsi: rsiValues[i],
      ema200: ema200Values[i],
      macd: macdValues[i] || undefined,
    };

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
