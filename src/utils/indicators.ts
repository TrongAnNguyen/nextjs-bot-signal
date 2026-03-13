import { RSI, EMA, MACD } from "technicalindicators";
import { MACDResult } from "./types";

// ============================================================
// Indicators — RSI, EMA, MACD calculation with index alignment
// ============================================================

/**
 * Calculate RSI values aligned to the candle array.
 *
 * `technicalindicators` returns an array shorter than the input
 * (it drops the first `period` values). We pad the front with NaN
 * so that rsiValues[i] corresponds to candles[i].
 */
export function calculateRSI(closePrices: number[], period: number): number[] {
  if (closePrices.length < period) return new Array(closePrices.length).fill(NaN);
  const raw = RSI.calculate({ values: closePrices, period });

  // Pad leading values so indices match the candle array
  const padding = closePrices.length - raw.length;
  const aligned: number[] = new Array(padding).fill(NaN);
  aligned.push(...raw);

  return aligned;
}

/**
 * Calculate EMA values aligned to the input array.
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return new Array(values.length).fill(NaN);
  const raw = EMA.calculate({ values, period });

  // Pad leading values so indices match the candle array
  const padding = values.length - raw.length;
  const aligned: number[] = new Array(padding).fill(NaN);
  aligned.push(...raw);

  return aligned;
}

/**
 * Calculate MACD values aligned to the input array.
 */
export function calculateMACD(
  values: number[], 
  fast: number, 
  slow: number, 
  signal: number
): (MACDResult | null)[] {
  // MACD needs slowPeriod + signalPeriod - 1 values to start producing results
  if (values.length < slow + signal - 1) return new Array(values.length).fill(null);

  const raw = MACD.calculate({
    values,
    fastPeriod: fast,
    slowPeriod: slow,
    signalPeriod: signal,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });

  // Pad leading values so indices match the candle array
  const padding = values.length - raw.length;
  const aligned: (MACDResult | null)[] = new Array(padding).fill(null);
  
  aligned.push(...raw.map(r => ({ 
    MACD: r.MACD ?? 0, 
    signal: r.signal ?? 0, 
    histogram: r.histogram ?? 0 
  })));

  return aligned;
}
