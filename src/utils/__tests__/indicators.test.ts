import { calculateEMA, calculateMACD } from "../indicators";

describe("indicators", () => {
  it("should calculate EMA aligned with input", () => {
    // Need at least 3 values for period 3
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const period = 3;
    const ema = calculateEMA(data, period);
    
    expect(ema.length).toBe(10);
    // EMA.calculate returns 10 - 3 + 1 = 8 values for period 3.
    // So 10 - 8 = 2 values are padded at the front.
    expect(isNaN(ema[0])).toBe(true);
    expect(isNaN(ema[1])).toBe(true);
    expect(isNaN(ema[2])).toBe(false);
  });

  it("should calculate MACD aligned with input", () => {
    // Need at least slow (26) + signal (9) = 35 values for typical MACD
    const data = new Array(40).fill(0).map((_, i) => i + 1);
    const macds = calculateMACD(data, 12, 26, 9);
    
    expect(macds.length).toBe(40);
    // For fast 12, slow 26, signal 9:
    // Raw MACD needs 26 values for the first EMA.
    // Then it needs 9 values of MACD for the signal line.
    // padding = 40 - raw.length
    const lastResult = macds[39];
    expect(lastResult).not.toBeNull();
    if (lastResult) {
      expect(typeof lastResult.MACD).toBe("number");
      expect(typeof lastResult.signal).toBe("number");
      expect(typeof lastResult.histogram).toBe("number");
    }
  });

  it("should return padded NaNs/nulls if data is too short", () => {
    const data = [1, 2, 3];
    const ema = calculateEMA(data, 10);
    expect(ema.every(v => isNaN(v))).toBe(true);

    const macds = calculateMACD(data, 12, 26, 9);
    expect(macds.every(v => v === null)).toBe(true);
  });
});
