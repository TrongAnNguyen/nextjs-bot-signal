import { Pivot, DivergenceSignal } from "./types";
import { config } from "./config";

// ============================================================
// Divergence Detection — regular & hidden
// ============================================================

/**
 * Detect Regular Bullish Divergence from the last two Pivot Lows.
 * Conditions: Price LL, RSI HL
 */
export function detectBullishDivergence(
  pivotLows: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
  maxLookback: number = 5,
  oversoldLevel: number = 20,
): DivergenceSignal | null {
  if (pivotLows.length < 2) return null;

  const curr = pivotLows[pivotLows.length - 1];
  const startIndex = pivotLows.length - 2;
  const endIndex = Math.max(0, pivotLows.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotLows[i];
    const distance = curr.index - prev.index;

    if (distance < minDist) continue;
    if (distance > maxDist) break;

    // Price: Lower Low or Double Bottom
    if (curr.price > prev.price) continue;

    // RSI: Higher Low
    if (curr.rsi <= prev.rsi) continue;

    const strict = prev.rsi < oversoldLevel;

    return {
      type: "bullish",
      category: "regular",
      symbol,
      timeframe,
      currentPivot: curr,
      previousPivot: prev,
      confirmed: true,
      strict,
    };
  }

  return null;
}

/**
 * Detect Hidden Bullish Divergence from the last two Pivot Lows.
 * Conditions: Price HL, RSI LL
 */
export function detectHiddenBullishDivergence(
  pivotLows: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
  maxLookback: number = config.hiddenDivergenceLookback,
): DivergenceSignal | null {
  if (pivotLows.length < 2) return null;

  const curr = pivotLows[pivotLows.length - 1];
  const startIndex = pivotLows.length - 2;
  const endIndex = Math.max(0, pivotLows.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotLows[i];
    const distance = curr.index - prev.index;

    if (distance < minDist) continue;
    if (distance > maxDist) break;

    // Price: Higher Low (curr > prev)
    if (curr.price <= prev.price) continue;

    // RSI: Lower Low (curr < prev)
    if (curr.rsi >= prev.rsi) continue;

    return {
      type: "bullish",
      category: "hidden",
      symbol,
      timeframe,
      currentPivot: curr,
      previousPivot: prev,
      confirmed: true,
      strict: false,
    };
  }

  return null;
}

/**
 * Detect Regular Bearish Divergence from the last two Pivot Highs.
 * Conditions: Price HH, RSI LH
 */
export function detectBearishDivergence(
  pivotHighs: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
  maxLookback: number = 5,
  overboughtLevel: number = 80,
): DivergenceSignal | null {
  if (pivotHighs.length < 2) return null;

  const curr = pivotHighs[pivotHighs.length - 1];
  const startIndex = pivotHighs.length - 2;
  const endIndex = Math.max(0, pivotHighs.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotHighs[i];
    const distance = curr.index - prev.index;

    if (distance < minDist) continue;
    if (distance > maxDist) break;

    // Price: Higher High or Double Top
    if (curr.price < prev.price) continue;

    // RSI: Lower High
    if (curr.rsi >= prev.rsi) continue;

    const strict = prev.rsi > overboughtLevel;

    return {
      type: "bearish",
      category: "regular",
      symbol,
      timeframe,
      currentPivot: curr,
      previousPivot: prev,
      confirmed: true,
      strict,
    };
  }

  return null;
}

/**
 * Detect Hidden Bearish Divergence from the last two Pivot Highs.
 * Conditions: Price LH, RSI HH
 */
export function detectHiddenBearishDivergence(
  pivotHighs: Pivot[],
  symbol: string,
  timeframe: string,
  minDist: number,
  maxDist: number,
  maxLookback: number = config.hiddenDivergenceLookback,
): DivergenceSignal | null {
  if (pivotHighs.length < 2) return null;

  const curr = pivotHighs[pivotHighs.length - 1];
  const startIndex = pivotHighs.length - 2;
  const endIndex = Math.max(0, pivotHighs.length - 1 - maxLookback);

  for (let i = startIndex; i >= endIndex; i--) {
    const prev = pivotHighs[i];
    const distance = curr.index - prev.index;

    if (distance < minDist) continue;
    if (distance > maxDist) break;

    // Price: Lower High (curr < prev)
    if (curr.price >= prev.price) continue;

    // RSI: Higher High (curr > prev)
    if (curr.rsi <= prev.rsi) continue;

    return {
      type: "bearish",
      category: "hidden",
      symbol,
      timeframe,
      currentPivot: curr,
      previousPivot: prev,
      confirmed: true,
      strict: false,
    };
  }

  return null;
}
