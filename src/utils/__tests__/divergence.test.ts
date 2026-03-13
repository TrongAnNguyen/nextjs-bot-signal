import { Pivot } from "../types";
import { 
  detectBullishDivergence, 
  detectBearishDivergence,
  detectHiddenBullishDivergence,
  detectHiddenBearishDivergence 
} from "../divergence";

describe("divergence detection", () => {
  const symbol = "BTC/USDT";
  const tf = "1h";

  describe("regular bullish divergence", () => {
    it("should detect regular bullish divergence (Price LL, RSI HL)", () => {
      const pivots: Pivot[] = [
        { index: 10, price: 100, rsi: 20, timestamp: 0, type: "low" },
        { index: 20, price: 90, rsi: 25, timestamp: 0, type: "low" }
      ];
      const signal = detectBullishDivergence(pivots, symbol, tf, 5, 50);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe("bullish");
      expect(signal?.category).toBe("regular");
    });
  });

  describe("hidden bullish divergence", () => {
    it("should detect hidden bullish divergence (Price HL, RSI LL)", () => {
      const pivots: Pivot[] = [
        { index: 10, price: 90, rsi: 40, timestamp: 0, type: "low" },
        { index: 20, price: 100, rsi: 30, timestamp: 0, type: "low" }
      ];
      const signal = detectHiddenBullishDivergence(pivots, symbol, tf, 5, 50);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe("bullish");
      expect(signal?.category).toBe("hidden");
    });
  });

  describe("regular bearish divergence", () => {
    it("should detect regular bearish divergence (Price HH, RSI LH)", () => {
      const pivots: Pivot[] = [
        { index: 10, price: 100, rsi: 80, timestamp: 0, type: "high" },
        { index: 20, price: 110, rsi: 75, timestamp: 0, type: "high" }
      ];
      const signal = detectBearishDivergence(pivots, symbol, tf, 5, 50);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe("bearish");
      expect(signal?.category).toBe("regular");
    });
  });

  describe("hidden bearish divergence", () => {
    it("should detect hidden bearish divergence (Price LH, RSI HH)", () => {
      const pivots: Pivot[] = [
        { index: 10, price: 110, rsi: 60, timestamp: 0, type: "high" },
        { index: 20, price: 100, rsi: 70, timestamp: 0, type: "high" }
      ];
      const signal = detectHiddenBearishDivergence(pivots, symbol, tf, 5, 50);
      expect(signal).not.toBeNull();
      expect(signal?.type).toBe("bearish");
      expect(signal?.category).toBe("hidden");
    });
  });
});
