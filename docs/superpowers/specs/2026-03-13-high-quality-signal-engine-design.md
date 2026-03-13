# High-Quality Signal Engine (The Confluence Engine)

## Overview
This design outlines a high-confidence signal generation engine that integrates multiple technical indicators, trend filters, and advanced divergence detection. The goal is to provide traders with a "Quality over Quantity" signal pipeline.

## Success Criteria
1. **Trend Alignment:** No signals are issued against the prevailing trend (defined by the 200 EMA).
2. **Momentum Confirmation:** All signals must be validated by a MACD crossover.
3. **Advanced Divergences:** Both Regular (reversals) and Hidden (continuation) divergences are detected.
4. **Accuracy:** Reduced noise compared to simple RSI divergence.

## Architecture & Data Flow

### 1. Data Acquisition
- **Fetch OHLCV:** Retrieve a minimum of 300-500 candles (to satisfy 200 EMA calculation requirements).

### 2. Indicator Suite
Calculate the following in parallel for the given timeframe:
- **RSI (14):** For divergence detection.
- **EMA (200):** For trend identification.
- **MACD (12, 26, 9):** For momentum validation.

### 3. Pipeline Stages
Each symbol/timeframe pair passes through a multi-stage validation:

| Stage | Logic | Purpose |
| :--- | :--- | :--- |
| **Trend Filter** | Price > 200 EMA = **Bullish Phase** | Only allow Bullish Signals. |
| | Price < 200 EMA = **Bearish Phase** | Only allow Bearish Signals. |
| **Divergence** | Scan for **Regular** & **Hidden** Divergences. | Identify potential setups. |
| **Validation** | Bullish Signal: MACD Line > Signal Line. | Confirm momentum shift. |
| | Bearish Signal: MACD Line < Signal Line. | Confirm momentum shift. |

## Detailed Components

### Divergence Logic
- **Regular Bullish:** Price Lower Low, RSI Higher Low (Reversal).
- **Regular Bearish:** Price Higher High, RSI Lower High (Reversal).
- **Hidden Bullish:** Price Higher Low, RSI Lower Low (Continuation in Uptrend).
- **Hidden Bearish:** Price Lower High, RSI Higher High (Continuation in Downtrend).

### The "Full Crossover" Rule (Strict)
A signal will only fire if the MACD crossover has *already occurred* within the last `X` candles (e.g., 3-5) following the divergence confirmation.

## Technical Implementation Notes
- Update `src/utils/types.ts` to include `MACD` and `EMA` data.
- Refactor `src/utils/scanner.ts` to implement the pipeline.
- Add `src/utils/indicators.ts` helper for EMA and MACD.
- Update `src/utils/divergence.ts` to include Hidden Divergence detection.

## Testing Strategy
- **Unit Tests:** Verify Hidden Divergence detection on mock data.
- **Backtest Verification:** Use the existing backtest dashboard to compare the "Old RSI Only" strategy vs. the "New Confluence Engine."
- **Visual Validation:** Ensure EMA and MACD indicators are rendered correctly on the UI charts.
