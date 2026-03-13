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
import { DivergenceSignal, ConfluenceAlert, ScanResult, MACDResult } from "./types";

// ============================================================
// Scanner — multi-timeframe divergence scanning
// ============================================================

/** Higher timeframes that produce stronger signals */
const HIGHER_TIMEFRAMES = new Set(["4h", "1d", "1w"]);

/**
 * Detect MACD crossover within the last N candles.
 */
function isMACDCrossover(
  macds: (MACDResult | null)[], 
  type: "bullish" | "bearish", 
  lookback: number
): boolean {
  const lastIndex = macds.length - 1;
  const startIndex = Math.max(0, lastIndex - lookback);
  
  for (let i = lastIndex; i > startIndex; i--) {
    const curr = macds[i];
    const prev = macds[i - 1];
    if (!curr || !prev) continue;
    
    if (type === "bullish" && prev.MACD <= prev.signal && curr.MACD > curr.signal) return true;
    if (type === "bearish" && prev.MACD >= prev.signal && curr.MACD < curr.signal) return true;
  }
  return false;
}

/**
 * Validate a signal based on Trend (200 EMA) and Momentum (MACD).
 */
function validateSignal(
  signal: DivergenceSignal, 
  ema200: number, 
  macds: (MACDResult | null)[], 
  price: number
): boolean {
  // 1. Trend Filter: Price vs EMA200 (Same TF Intraday)
  const isAboveEMA = price > ema200;
  if (signal.type === "bullish" && !isAboveEMA) return false;
  if (signal.type === "bearish" && isAboveEMA) return false;

  // 2. MACD Crossover Filter (Strict)
  return isMACDCrossover(macds, signal.type, config.macdCrossoverLookback);
}

/**
 * Scan a single symbol on a single timeframe.
 * Returns any detected divergence signals.
 */
export async function scanSymbolTimeframe(
  symbol: string,
  timeframe: string,
): Promise<ScanResult> {
  const result: ScanResult = {
    symbol,
    timeframe,
    divergences: [],
    timestamp: Date.now(),
  };

  // 1. Fetch candles
  const candles = await fetchCandles(symbol, timeframe, config.candleLimit);
  if (candles.length < config.emaPeriod) {
    console.log(
      `[Scanner] Not enough candles for ${symbol} ${timeframe} (got ${candles.length})`,
    );
    return result;
  }

  // 2. Calculate Indicators
  const closePrices = candles.map((c) => c.close);
  const rsiValues = calculateRSI(closePrices, config.rsiPeriod);
  const ema200Values = calculateEMA(closePrices, config.emaPeriod);
  const macdValues = calculateMACD(closePrices, config.macdFast, config.macdSlow, config.macdSignal);

  const lastIndex = candles.length - 1;
  const currentPrice = closePrices[lastIndex];
  const currentEMA = ema200Values[lastIndex];
  const currentMACD = macdValues[lastIndex];

  if (isNaN(currentEMA) || !currentMACD) {
    return result;
  }

  // 3. Detect Divergences (Regular & Hidden)
  const pivotLows = findPivotLows(candles, rsiValues, config.pivotStrength, config.pivotRightStrength);
  const pivotHighs = findPivotHighs(candles, rsiValues, config.pivotStrength, config.pivotRightStrength);

  const candidates: DivergenceSignal[] = [];

  // Check Regular Bullish
  const regBull = detectBullishDivergence(pivotLows, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance);
  if (regBull) candidates.push(regBull);

  // Check Hidden Bullish
  const hidBull = detectHiddenBullishDivergence(pivotLows, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance);
  if (hidBull) candidates.push(hidBull);

  // Check Regular Bearish
  const regBear = detectBearishDivergence(pivotHighs, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance);
  if (regBear) candidates.push(regBear);

  // Check Hidden Bearish
  const hidBear = detectHiddenBearishDivergence(pivotHighs, symbol, timeframe, config.minPivotDistance, config.maxPivotDistance);
  if (hidBear) candidates.push(hidBear);

  // 4. Validate candidates
  for (const signal of candidates) {
    if (validateSignal(signal, currentEMA, macdValues, currentPrice)) {
      signal.ema200 = currentEMA;
      signal.macd = currentMACD;
      result.divergences.push(signal);
      
      const icon = signal.type === "bullish" ? "🟢" : "🔴";
      console.log(
        `[Scanner] ${icon} ${signal.category.toUpperCase()} ${signal.type} divergence on ${symbol} ${timeframe} ` +
        `| Price: ${signal.currentPivot.price} | RSI: ${signal.currentPivot.rsi.toFixed(2)}`
      );
    }
  }

  return result;
}

/**
 * Scan all symbols across all timeframes.
 */
export async function scanAll(
  symbols: string[],
  timeframes: string[],
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];

  for (const symbol of symbols) {
    for (const tf of timeframes) {
      const result = await scanSymbolTimeframe(symbol, tf);
      results.push(result);
    }
  }

  return results;
}

/**
 * Detect confluence: same divergence type on multiple timeframes
 * for the same symbol → higher confidence.
 */
export function detectConfluence(results: ScanResult[]): ConfluenceAlert[] {
  // Group divergences by (symbol, divergence type)
  const groups = new Map<string, DivergenceSignal[]>();

  for (const result of results) {
    for (const div of result.divergences) {
      const key = `${div.symbol}::${div.type}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(div);
    }
  }

  const alerts: ConfluenceAlert[] = [];

  for (const [key, signals] of groups) {
    const [symbol, type] = key.split("::");
    const timeframes = signals.map((s) => s.timeframe);

    let confidence: ConfluenceAlert["confidence"];

    if (timeframes.length >= 2) {
      // Multi-timeframe confluence → High
      confidence = "High";
    } else if (HIGHER_TIMEFRAMES.has(timeframes[0])) {
      // Single higher timeframe → Medium
      confidence = "Medium";
    } else {
      // Single lower timeframe → Low
      confidence = "Low";
    }

    alerts.push({
      symbol,
      signal: type as DivergenceSignal["type"],
      timeframes,
      signals,
      confidence,
    });
  }

  return alerts;
}
