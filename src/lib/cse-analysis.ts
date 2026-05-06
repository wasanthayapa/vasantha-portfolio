export interface OHLCVData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  sma20: number | null;
  sma50: number | null;
}

export interface MACDResult {
  macd: number;
  signal: number;
  histogram: number;
}

export interface TechnicalIndicators {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  open: number;
  high: number;
  low: number;
  weekHigh52: number;
  weekLow52: number;
  volume: number;
  sma20: number | null;
  sma50: number | null;
  rsi14: number | null;
  macd: MACDResult | null;
}

export type Recommendation = "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL";

export interface Signal {
  name: string;
  value: string;
  signal: "bullish" | "bearish" | "neutral";
  description: string;
  score: number;
}

export interface StockAnalysis {
  symbol: string;
  name: string;
  sector: string;
  indicators: TechnicalIndicators;
  recommendation: Recommendation;
  confidence: number;
  score: number;
  signals: Signal[];
  chartData: ChartDataPoint[];
}

function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    return closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

function calcEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return result;

  const changes = closes.slice(1).map((c, i) => c - closes[i]);

  let avgGain = changes.slice(0, period).filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  let avgLoss = changes.slice(0, period).filter(c => c < 0).reduce((a, b) => a + Math.abs(b), 0) / period;

  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const change = changes[i - 1];
    avgGain = (avgGain * (period - 1) + (change > 0 ? change : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (change < 0 ? Math.abs(change) : 0)) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return result;
}

function calcMACD(closes: number[]): {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
} {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);

  const macdLine: (number | null)[] = closes.map((_, i) =>
    i < 25 ? null : ema12[i] - ema26[i]
  );

  const macdValues = macdLine.filter((v): v is number => v !== null);
  const signalValues = calcEMA(macdValues, 9);

  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  const startIdx = macdLine.findIndex(v => v !== null);
  signalValues.forEach((v, i) => {
    signalLine[startIdx + i] = v;
  });

  const histogram: (number | null)[] = closes.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    return m !== null && s !== null ? m - s : null;
  });

  return { macd: macdLine, signal: signalLine, histogram };
}

export function analyzeStock(
  symbol: string,
  name: string,
  sector: string,
  data: OHLCVData[]
): StockAnalysis {
  const closes = data.map(d => d.close);
  const n = closes.length - 1;

  const sma20Values = calcSMA(closes, 20);
  const sma50Values = calcSMA(closes, 50);
  const rsiValues = calcRSI(closes, 14);
  const macdCalc = calcMACD(closes);

  const currentPrice = closes[n];
  const prevPrice = closes[n - 1] ?? currentPrice;
  const sma20 = sma20Values[n];
  const sma50 = sma50Values[n];
  const rsi14 = rsiValues[n];

  const macdVal = macdCalc.macd[n];
  const signalVal = macdCalc.signal[n];
  const histVal = macdCalc.histogram[n];
  const macd =
    macdVal !== null && signalVal !== null && histVal !== null
      ? { macd: macdVal, signal: signalVal, histogram: histVal }
      : null;

  const indicators: TechnicalIndicators = {
    currentPrice,
    priceChange: currentPrice - prevPrice,
    priceChangePercent: ((currentPrice - prevPrice) / prevPrice) * 100,
    open: data[n].open,
    high: data[n].high,
    low: data[n].low,
    weekHigh52: Math.max(...closes),
    weekLow52: Math.min(...closes),
    volume: data[n].volume,
    sma20,
    sma50,
    rsi14,
    macd,
  };

  const signals: Signal[] = [];
  let totalScore = 0;

  if (rsi14 !== null) {
    let score: number, sig: Signal["signal"], desc: string;
    if (rsi14 < 30) {
      score = 2; sig = "bullish"; desc = "Oversold — strong buying opportunity";
    } else if (rsi14 < 45) {
      score = 1; sig = "bullish"; desc = "Approaching oversold territory";
    } else if (rsi14 <= 55) {
      score = 0; sig = "neutral"; desc = "Neutral momentum zone";
    } else if (rsi14 <= 70) {
      score = -1; sig = "bearish"; desc = "Approaching overbought territory";
    } else {
      score = -2; sig = "bearish"; desc = "Overbought — potential selling pressure";
    }
    signals.push({ name: "RSI (14)", value: rsi14.toFixed(1), signal: sig, description: desc, score });
    totalScore += score;
  }

  if (sma20 !== null && sma50 !== null) {
    const above20 = currentPrice > sma20;
    const above50 = currentPrice > sma50;
    const goldenCross = sma20 > sma50;
    let score: number, sig: Signal["signal"], desc: string;
    if (above20 && above50 && goldenCross) {
      score = 2; sig = "bullish"; desc = "Price above both MAs — golden cross active";
    } else if (above20 || (above50 && goldenCross)) {
      score = 1; sig = "bullish"; desc = "Price above a key moving average";
    } else if (!above20 && !above50 && !goldenCross) {
      score = -2; sig = "bearish"; desc = "Price below both MAs — death cross active";
    } else {
      score = -1; sig = "bearish"; desc = "Price below a key moving average";
    }
    signals.push({
      name: "Moving Averages",
      value: `SMA20: ${sma20.toFixed(2)} / SMA50: ${sma50.toFixed(2)}`,
      signal: sig,
      description: desc,
      score,
    });
    totalScore += score;
  }

  if (macd !== null) {
    let score: number, sig: Signal["signal"], desc: string;
    if (macd.macd > macd.signal && macd.macd > 0) {
      score = 2; sig = "bullish"; desc = "MACD above signal in positive territory";
    } else if (macd.macd > macd.signal) {
      score = 1; sig = "bullish"; desc = "Bullish MACD crossover";
    } else if (macd.macd < macd.signal && macd.macd < 0) {
      score = -2; sig = "bearish"; desc = "MACD below signal in negative territory";
    } else {
      score = -1; sig = "bearish"; desc = "Bearish MACD crossover";
    }
    signals.push({
      name: "MACD",
      value: `${macd.macd.toFixed(2)} / Signal: ${macd.signal.toFixed(2)}`,
      signal: sig,
      description: desc,
      score,
    });
    totalScore += score;
  }

  let recommendation: Recommendation;
  if (totalScore >= 4) recommendation = "STRONG BUY";
  else if (totalScore >= 2) recommendation = "BUY";
  else if (totalScore >= -1) recommendation = "HOLD";
  else if (totalScore >= -3) recommendation = "SELL";
  else recommendation = "STRONG SELL";

  const maxScore = signals.length * 2;
  const confidence =
    maxScore > 0 ? Math.round(((totalScore + maxScore) / (2 * maxScore)) * 100) : 50;

  const chartData: ChartDataPoint[] = data.map((d, i) => ({
    date: d.date,
    close: d.close,
    open: d.open,
    high: d.high,
    low: d.low,
    volume: d.volume,
    sma20: sma20Values[i],
    sma50: sma50Values[i],
  }));

  return {
    symbol,
    name,
    sector,
    indicators,
    recommendation,
    confidence,
    score: totalScore,
    signals,
    chartData,
  };
}
