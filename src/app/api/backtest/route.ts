import { NextRequest, NextResponse } from "next/server";
import { runBacktest } from "@/utils/backtest";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC/USDT";
  const timeframe = searchParams.get("timeframe") || "1h";
  const limit = parseInt(searchParams.get("limit") || "500");

  try {
    const data = await runBacktest(symbol, timeframe, limit);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Backtest Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to run backtest" },
      { status: 500 },
    );
  }
}
