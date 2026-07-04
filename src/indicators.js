/**
 * Technical Indicators
 * Provides various technical analysis calculations
 */

class Indicators {
  calculateRSI(prices, period = 14) {
    const rsi = [];
    const deltas = [];
    
    for (let i = 1; i < prices.length; i++) {
      deltas.push(prices[i] - prices[i - 1]);
    }

    let gains = 0, losses = 0;
    for (let i = 0; i < period && i < deltas.length; i++) {
      if (deltas[i] > 0) gains += deltas[i];
      else losses += -deltas[i];
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period; i < deltas.length; i++) {
      const gain = deltas[i] > 0 ? deltas[i] : 0;
      const loss = deltas[i] < 0 ? -deltas[i] : 0;

      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }

    return rsi;
  }

  calculateMA(prices, period = 20) {
    const ma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
    return ma;
  }

  calculateEMA(prices, period = 20) {
    const ema = [];
    const multiplier = 2 / (period + 1);

    const smaSum = prices.slice(0, period).reduce((a, b) => a + b, 0);
    let emaValue = smaSum / period;
    ema.push(emaValue);

    for (let i = period; i < prices.length; i++) {
      emaValue = (prices[i] - emaValue) * multiplier + emaValue;
      ema.push(emaValue);
    }

    return ema;
  }

  calculateBollingerBands(prices, period = 20, deviation = 2) {
    const ma = this.calculateMA(prices, period);
    const bands = [];

    for (let i = period - 1; i < prices.length; i++) {
      const subset = prices.slice(i - period + 1, i + 1);
      const mean = subset.reduce((a, b) => a + b, 0) / period;
      const variance = subset.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      bands.push({
        upper: ma[i - period + 1] + (stdDev * deviation),
        middle: ma[i - period + 1],
        lower: ma[i - period + 1] - (stdDev * deviation)
      });
    }

    return bands;
  }

  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    const macd = [];
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macd.push(fastEMA[i] - slowEMA[i]);
    }

    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram = [];

    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i]);
    }

    return { macd, signal, histogram };
  }

  calculateATR(candles, period = 14) {
    const tr = [];

    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];

      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);

      tr.push(Math.max(tr1, tr2, tr3));
    }

    const atr = [];
    let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
    atr.push(sum / period);

    for (let i = period; i < tr.length; i++) {
      const newATR = (atr[i - period] * (period - 1) + tr[i]) / period;
      atr.push(newATR);
    }

    return atr;
  }
}

module.exports = Indicators;
