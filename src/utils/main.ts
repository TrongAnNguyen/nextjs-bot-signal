import { Telegraf } from "telegraf";
import { config } from "./config";
import { scanAll, detectConfluence } from "./scanner";
import { sendAlert } from "./telegram";
import { redis } from "@/lib/redis";
import { ConfluenceAlert } from "./types";

// ============================================================
// Main — entry point for the RSI Divergence Signal Bot
// ============================================================

const ALERT_TTL_SECONDS = 12 * 60 * 60; // 12 hours

/**
 * Generate a unique dedup key for an alert.
 * Two alerts are the same if they share the same timeframe, price, and direction.
 * We build the key from each individual signal's properties.
 */
function getAlertDeduplicationKey(alert: ConfluenceAlert): string {
  const signalFingerprints = alert.signals
    .map((s) => `${s.timeframe}:${s.currentPivot.price}:${s.type}`)
    .sort()
    .join("|");

  return `alert:dedup:${alert.symbol}:${signalFingerprints}`;
}

export async function runScanCycle(bot?: Telegraf): Promise<void> {
  const start = Date.now();
  console.log(`\n⏳ [${new Date().toISOString()}] Starting scan cycle...`);

  try {
    // 1. Scan all symbols × all timeframes
    const results = await scanAll(config.symbols, config.timeframes);

    // 2. Count total divergences found
    const totalDivergences = results.reduce(
      (sum, r) => sum + r.divergences.length,
      0,
    );

    // 3. Detect confluence across timeframes
    const alerts = detectConfluence(results);

    console.log(
      `✅ Scan complete in ${((Date.now() - start) / 1000).toFixed(1)}s ` +
        `| ${totalDivergences} divergence(s) | ${alerts.length} alert(s)`,
    );

    // 4. Deduplicate & send alerts via Telegram
    for (const alert of alerts) {
      const dedupKey = getAlertDeduplicationKey(alert);
      const existing = await redis.get(dedupKey);

      if (existing) {
        console.log(
          `⏭️  Skipping duplicate alert for ${alert.symbol} ${alert.signal} (sent within 12h)`,
        );
        continue;
      }

      await sendAlert(alert, bot);
      await redis.set(
        dedupKey,
        { sentAt: new Date().toISOString() },
        ALERT_TTL_SECONDS,
      );
    }
  } catch (error) {
    console.error("❌ Scan cycle error:", error);
  }
}
