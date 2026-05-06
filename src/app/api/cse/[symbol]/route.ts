import { NextResponse } from "next/server";
import { CSE_STOCKS } from "@/lib/cse-stocks";
import { analyzeStock, type OHLCVData } from "@/lib/cse-analysis";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  const stock = CSE_STOCKS.find((s) => s.symbol === symbol);

  if (!stock) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  try {
    const yahooSymbol = `${symbol}.CM`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=6mo`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Data provider returned ${response.status}`);
    }

    const json = await response.json();

    if (!json.chart?.result?.[0]) {
      throw new Error("No market data available for this symbol");
    }

    const result = json.chart.result[0];
    const { timestamp, indicators: { quote }, meta } = result;
    const quote0 = quote[0];

    const ohlcvData: OHLCVData[] = [];
    for (let i = 0; i < timestamp.length; i++) {
      if (
        quote0.close[i] != null &&
        quote0.open[i] != null &&
        quote0.high[i] != null &&
        quote0.low[i] != null
      ) {
        ohlcvData.push({
          date: new Date(timestamp[i] * 1000).toISOString().slice(0, 10),
          open: quote0.open[i],
          high: quote0.high[i],
          low: quote0.low[i],
          close: quote0.close[i],
          volume: quote0.volume?.[i] ?? 0,
        });
      }
    }

    if (ohlcvData.length < 20) {
      throw new Error("Insufficient historical data for analysis (need at least 20 trading days)");
    }

    const analysis = analyzeStock(symbol, stock.name, stock.sector, ohlcvData);

    // Override with live price from meta if available
    if (meta.regularMarketPrice) {
      const live = meta.regularMarketPrice as number;
      const prev = meta.previousClose as number ?? ohlcvData[ohlcvData.length - 2]?.close;
      analysis.indicators.currentPrice = live;
      analysis.indicators.priceChange = live - prev;
      analysis.indicators.priceChangePercent = ((live - prev) / prev) * 100;
    }

    return NextResponse.json(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch market data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
