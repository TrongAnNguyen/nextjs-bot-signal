import { Telegraf } from "telegraf";
import { config } from "./config";
import { scanAll, detectConfluence } from "./scanner";
import { sendAlert } from "./telegram";

// ============================================================
// Main — entry point for the RSI Divergence Signal Bot
// ============================================================

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

    // 4. Send alerts via Telegram
    for (const alert of alerts) {
      await sendAlert(alert, bot);
    }
  } catch (error) {
    console.error("❌ Scan cycle error:", error);
  }
}
