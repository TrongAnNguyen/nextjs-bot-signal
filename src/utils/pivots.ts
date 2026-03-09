import { Candle, Pivot } from "./types";

// ============================================================
// Pivot Detection — swing highs and swing lows
// ============================================================

/**
 * Find Pivot Lows (troughs).
 *
 * A candle at index `i` is a Pivot Low if its `low` price is
 * strictly lower than the `low` of the leftBars candles before AND
 * the rightBars candles after it.
 */
export function findPivotLows(
  candles: Candle[],
  rsiValues: number[],
  leftBars: number,
  rightBars: number,
): Pivot[] {
  const pivots: Pivot[] = [];

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    const currentLow = candles[i].low;
    let isPivot = true;

    // Check leftBars before
    for (let j = 1; j <= leftBars; j++) {
      if (currentLow >= candles[i - j].low) {
        isPivot = false;
        break;
      }
    }

    if (!isPivot) continue;

    // Check rightBars after
    for (let j = 1; j <= rightBars; j++) {
      if (currentLow >= candles[i + j].low) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && !isNaN(rsiValues[i])) {
      pivots.push({
        index: i,
        price: currentLow,
        rsi: rsiValues[i],
        timestamp: candles[i].timestamp,
        type: "low",
      });
    }
  }

  return pivots;
}

/**
 * Find Pivot Highs (peaks).
 *
 * A candle at index `i` is a Pivot High if its `high` price is
 * strictly higher than the `high` of the leftBars candles before AND
 * the rightBars candles after it.
 */
export function findPivotHighs(
  candles: Candle[],
  rsiValues: number[],
  leftBars: number,
  rightBars: number,
): Pivot[] {
  const pivots: Pivot[] = [];

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    const currentHigh = candles[i].high;
    let isPivot = true;

    // Check leftBars before
    for (let j = 1; j <= leftBars; j++) {
      if (currentHigh <= candles[i - j].high) {
        isPivot = false;
        break;
      }
    }

    if (!isPivot) continue;

    // Check rightBars after
    for (let j = 1; j <= rightBars; j++) {
      if (currentHigh <= candles[i + j].high) {
        isPivot = false;
        break;
      }
    }

    if (isPivot && !isNaN(rsiValues[i])) {
      pivots.push({
        index: i,
        price: currentHigh,
        rsi: rsiValues[i],
        timestamp: candles[i].timestamp,
        type: "high",
      });
    }
  }

  return pivots;
}
