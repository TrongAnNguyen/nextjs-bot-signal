import { config } from "@/utils/config";
import { NextRequest, NextResponse } from "next/server";
import { Telegraf } from "telegraf";
import { runScanCycle } from "@/utils/main";

export const POST = async (request: NextRequest) => {
  const secret = request.headers.get("x-secret");
  if (secret !== process.env.SCAN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bot = new Telegraf(config.telegramBotToken);
  await runScanCycle(bot);

  return NextResponse.json({ message: "Scan completed" });
};
