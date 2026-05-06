"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CSE_STOCKS } from "@/lib/cse-stocks";
import type { StockAnalysis, Recommendation, Signal } from "@/lib/cse-analysis";

// Avoid SSR for recharts
const ChartContainer = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { ssr: false }
);

function formatLKR(value: number): string {
  return `LKR ${value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const REC_CONFIG: Record<
  Recommendation,
  { label: string; color: string; bg: string; border: string }
> = {
  "STRONG BUY": {
    label: "STRONG BUY",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  BUY: {
    label: "BUY",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  HOLD: {
    label: "HOLD",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  SELL: {
    label: "SELL",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  "STRONG SELL": {
    label: "STRONG SELL",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

function SignalBadge({ signal }: { signal: Signal["signal"] }) {
  if (signal === "bullish")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
        ↑ Bullish
      </span>
    );
  if (signal === "bearish")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
        ↓ Bearish
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
      → Neutral
    </span>
  );
}

function RSIGauge({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    value < 30 ? "#4ade80" : value > 70 ? "#f87171" : "#facc15";
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold" style={{ color }}>
          {value.toFixed(1)}
        </span>
        <span className="text-xs text-white/50">
          {value < 30 ? "Oversold" : value > 70 ? "Overbought" : "Neutral"}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div className="absolute top-0 h-2 w-px bg-white/30" style={{ left: "30%" }} />
        <div className="absolute top-0 h-2 w-px bg-white/30" style={{ left: "70%" }} />
      </div>
      <div className="flex justify-between text-xs text-white/30">
        <span>0</span>
        <span>30</span>
        <span>70</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value, rec }: { value: number; rec: Recommendation }) {
  const cfg = REC_CONFIG[rec];
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className={`text-2xl font-semibold ${cfg.color}`}>{value}%</span>
        <span className="text-xs text-white/50">confidence</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full transition-all ${cfg.color.replace("text-", "bg-").replace("-400", "-500")}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220]/95 p-3 text-xs shadow-xl">
      <p className="mb-1.5 font-medium text-white/70">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: LKR {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function CSEAnalyzer() {
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalysis(symbol: string) {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch(`/api/cse/${symbol}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data as StockAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const chartData = analysis?.chartData.slice(-90).map((d) => ({
    date: formatDate(d.date),
    Price: d.close,
    "SMA 20": d.sma20 ?? undefined,
    "SMA 50": d.sma50 ?? undefined,
  }));

  const rec = analysis ? REC_CONFIG[analysis.recommendation] : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#070b14] to-[#0b1220] text-white">
      <div className="mx-auto max-w-6xl px-5 py-10">

        {/* Nav */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            ← Portfolio
          </Link>
          <span className="text-xs text-white/30">
            Data via Yahoo Finance · For educational use only
          </span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <span className="rounded-lg bg-[#6ea8fe]/20 px-2.5 py-1 text-xs font-medium text-[#6ea8fe]">
              CSE
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Colombo Stock Exchange Analyzer
            </h1>
          </div>
          <p className="text-sm text-white/50">
            Technical analysis with RSI, MACD, and Moving Averages for buy/sell recommendations
          </p>
        </div>

        {/* Stock Selector */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="mb-3 text-sm font-medium text-white/70">Select a CSE Listed Stock</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#6ea8fe]/50 focus:ring-1 focus:ring-[#6ea8fe]/30"
            >
              <option value="" className="bg-[#0b1220]">
                — Choose a stock —
              </option>
              {CSE_STOCKS.map((s) => (
                <option key={s.symbol} value={s.symbol} className="bg-[#0b1220]">
                  {s.symbol} — {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchAnalysis(selectedSymbol)}
              disabled={!selectedSymbol || loading}
              className="rounded-xl bg-[#6ea8fe]/20 px-6 py-3 text-sm font-medium text-[#6ea8fe] transition hover:bg-[#6ea8fe]/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            <span className="font-medium">Error: </span>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-6">

            {/* Stock header */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-2xl font-bold">{analysis.symbol}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
                      {analysis.sector}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">{analysis.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">
                    {formatLKR(analysis.indicators.currentPrice)}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      analysis.indicators.priceChange >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {analysis.indicators.priceChange >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(analysis.indicators.priceChange).toFixed(2)} (
                    {Math.abs(analysis.indicators.priceChangePercent).toFixed(2)}%)
                  </p>
                </div>
              </div>

              {/* Key stats */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Open", value: formatLKR(analysis.indicators.open) },
                  { label: "High", value: formatLKR(analysis.indicators.high) },
                  { label: "Low", value: formatLKR(analysis.indicators.low) },
                  { label: "Volume", value: formatVolume(analysis.indicators.volume) },
                  {
                    label: "52W High",
                    value: formatLKR(analysis.indicators.weekHigh52),
                  },
                  {
                    label: "52W Low",
                    value: formatLKR(analysis.indicators.weekLow52),
                  },
                  {
                    label: "SMA 20",
                    value: analysis.indicators.sma20
                      ? formatLKR(analysis.indicators.sma20)
                      : "—",
                  },
                  {
                    label: "SMA 50",
                    value: analysis.indicators.sma50
                      ? formatLKR(analysis.indicators.sma50)
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/5 bg-white/5 p-3"
                  >
                    <p className="text-xs text-white/40">{label}</p>
                    <p className="mt-0.5 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Chart */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-4 text-sm font-medium text-white/70">
                Price History — Last 90 Trading Days
              </p>
              <ChartContainer>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={14}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => v.toFixed(0)}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Price"
                      stroke="#6ea8fe"
                      fill="rgba(110,168,254,0.08)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="SMA 20"
                      stroke="#fbbf24"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 2"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="SMA 50"
                      stroke="#34d399"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="6 3"
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Technical Indicators */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* RSI */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                  RSI (14)
                </p>
                {analysis.indicators.rsi14 !== null ? (
                  <RSIGauge value={analysis.indicators.rsi14} />
                ) : (
                  <p className="text-sm text-white/40">Insufficient data</p>
                )}
              </div>

              {/* MACD */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                  MACD
                </p>
                {analysis.indicators.macd ? (
                  <div className="space-y-3">
                    {[
                      { label: "MACD Line", val: analysis.indicators.macd.macd },
                      { label: "Signal Line", val: analysis.indicators.macd.signal },
                      { label: "Histogram", val: analysis.indicators.macd.histogram },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-baseline justify-between">
                        <span className="text-xs text-white/50">{label}</span>
                        <span
                          className={`text-sm font-medium ${
                            val >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {val.toFixed(4)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-1 pt-2 border-t border-white/5">
                      <SignalBadge
                        signal={
                          analysis.indicators.macd.macd > analysis.indicators.macd.signal
                            ? "bullish"
                            : "bearish"
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/40">Insufficient data</p>
                )}
              </div>

              {/* MA Status */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                  Moving Averages
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "vs SMA 20",
                      ma: analysis.indicators.sma20,
                      current: analysis.indicators.currentPrice,
                    },
                    {
                      label: "vs SMA 50",
                      ma: analysis.indicators.sma50,
                      current: analysis.indicators.currentPrice,
                    },
                  ].map(({ label, ma, current }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{label}</span>
                      {ma !== null ? (
                        <SignalBadge signal={current > ma ? "bullish" : "bearish"} />
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </div>
                  ))}
                  {analysis.indicators.sma20 !== null &&
                    analysis.indicators.sma50 !== null && (
                      <div className="flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="text-xs text-white/50">Cross Signal</span>
                        <SignalBadge
                          signal={
                            analysis.indicators.sma20 > analysis.indicators.sma50
                              ? "bullish"
                              : "bearish"
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            {rec && (
              <div
                className={`rounded-2xl border ${rec.border} ${rec.bg} p-6`}
              >
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
                  Recommendation
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className={`text-4xl font-bold tracking-tight ${rec.color}`}>
                      {rec.label}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      Score: {analysis.score > 0 ? "+" : ""}
                      {analysis.score} / {analysis.signals.length * 2} &nbsp;·&nbsp;{" "}
                      {analysis.signals.length} signal{analysis.signals.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[160px] max-w-[240px]">
                    <ConfidenceMeter value={analysis.confidence} rec={analysis.recommendation} />
                  </div>
                </div>
              </div>
            )}

            {/* Signals Detail */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="mb-4 text-sm font-medium text-white/70">Signal Breakdown</p>
              <div className="space-y-3">
                {analysis.signals.map((sig) => (
                  <div
                    key={sig.name}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{sig.name}</span>
                        <SignalBadge signal={sig.signal} />
                      </div>
                      <p className="text-xs text-white/50">{sig.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-white/40 mb-0.5">Value</p>
                      <p className="text-xs font-mono text-white/70">{sig.value}</p>
                      <p
                        className={`text-xs font-semibold mt-1 ${
                          sig.score > 0
                            ? "text-green-400"
                            : sig.score < 0
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {sig.score > 0 ? "+" : ""}
                        {sig.score} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-white/25 pb-6">
              This analysis is for educational purposes only and does not constitute financial
              advice. Past performance is not indicative of future results. Always consult a
              licensed financial advisor before making investment decisions.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
