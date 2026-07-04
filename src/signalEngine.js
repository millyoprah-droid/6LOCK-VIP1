/**
 * Signal Engine - Core signal generation logic
 * Combines multiple indicators for trading signals
 */

const Indicators = require('./indicators');
const Logger = require('./utils/logger');

class SignalEngine {
  constructor() {
    this.indicators = new Indicators();
    this.logger = new Logger();
    this.scoreWeights = {
      intraday: 0.40,
      shortTerm: 0.30,
      mediumTerm: 0.30
    };
  }

  async generateSignal(symbol, candleData) {
    try {
      const intradayScore = this.calculateIntradayScore(candleData);
      const shortTermScore = this.calculateShortTermScore(candleData);
      const mediumTermScore = this.calculateMediumTermScore(candleData);

      const totalConfidence = (
        intradayScore * this.scoreWeights.intraday +
        shortTermScore * this.scoreWeights.shortTerm +
        mediumTermScore * this.scoreWeights.mediumTerm
      );

      const signalType = this.determineSignalType(candleData, intradayScore, shortTermScore, mediumTermScore);
      if (!signalType) return null;

      const levels = this.calculateLevels(symbol, candleData, signalType);

      const signal = {
        symbol: symbol,
        type: signalType,
        confidence: Math.round(totalConfidence),
        intradayScore: Math.round(intradayScore),
        shortTermScore: Math.round(shortTermScore),
        mediumTermScore: Math.round(mediumTermScore),
        entry: levels.entry,
        stopLoss: levels.stopLoss,
        takeProfit: levels.takeProfit,
        timeframe: this.getPrimaryTimeframe(signalType),
        timestamp: new Date()
      };

      return signal;
    } catch (error) {
      this.logger.log(`Signal generation error: ${error.message}`, 'error');
      return null;
    }
  }

  calculateIntradayScore(candleData) {
    let score = 0;
    const intradayTFs = ['15m', '30m'];
    let count = 0;

    for (const tf of intradayTFs) {
      if (!candleData[tf]) continue;
      const candles = candleData[tf];
      const liquidityScore = this.analyzeLiquidity(candles) * 15;
      const momentumScore = this.analyzeMomentum(candles) * 15;
      const breakoutScore = this.analyzeBreakout(candles) * 10;
      score += liquidityScore + momentumScore + breakoutScore;
      count += 1;
    }

    return count > 0 ? Math.min(score / count, 40) : 0;
  }

  calculateShortTermScore(candleData) {
    let score = 0;
    const shortTermTFs = ['1h', '2h', '4h'];
    let count = 0;

    for (const tf of shortTermTFs) {
      if (!candleData[tf]) continue;
      const candles = candleData[tf];
      const msrnScore = this.analyzeMSNR(candles) * 12;
      const srScore = this.analyzeSupportResistance(candles) * 10;
      const rbsScore = this.analyzeRBS(candles) * 8;
      score += msrnScore + srScore + rbsScore;
      count += 1;
    }

    return count > 0 ? Math.min(score / count, 30) : 0;
  }

  calculateMediumTermScore(candleData) {
    let score = 0;
    const mediumTermTFs = ['1d', '1w'];
    let count = 0;

    for (const tf of mediumTermTFs) {
      if (!candleData[tf]) continue;
      const candles = candleData[tf];
      const sbrScore = this.analyzeSBR(candles) * 12;
      const confluenceScore = this.analyzeConfluence(candles) * 10;
      const crtScore = this.analyzeCRT(candles) * 8;
      score += sbrScore + confluenceScore + crtScore;
      count += 1;
    }

    return count > 0 ? Math.min(score / count, 30) : 0;
  }

  analyzeLiquidity(candles) {
    if (candles.length < 20) return 0;
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const maxHigh = Math.max(...highs.slice(-20));
    const minLow = Math.min(...lows.slice(-20));
    const currentPrice = candles[candles.length - 1].close;
    let liquidityScore = 0;
    if (Math.abs(currentPrice - maxHigh) / maxHigh < 0.001) liquidityScore += 0.5;
    if (Math.abs(currentPrice - minLow) / minLow < 0.001) liquidityScore += 0.5;
    return Math.min(liquidityScore, 1);
  }

  analyzeMomentum(candles) {
    if (candles.length < 5) return 0;
    const closes = candles.map(c => c.close);
    const rsi = this.calculateRSI(closes, 14);
    const lastRSI = rsi[rsi.length - 1] || 50;
    let momentum = 0;
    if (lastRSI > 70) momentum = 0.8;
    else if (lastRSI > 60) momentum = 0.6;
    else if (lastRSI > 50) momentum = 0.3;
    else if (lastRSI < 30) momentum = -0.8;
    else if (lastRSI < 40) momentum = -0.6;
    return momentum;
  }

  analyzeBreakout(candles) {
    if (candles.length < 50) return 0;
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const recent50High = Math.max(...highs.slice(-50));
    const recent50Low = Math.min(...lows.slice(-50));
    const currentPrice = candles[candles.length - 1].close;
    if (currentPrice > recent50High) return 0.8;
    if (currentPrice < recent50Low) return 0.8;
    return 0.2;
  }

  analyzeMSNR(candles) {
    if (candles.length < 30) return 0;
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const recentHighs = highs.slice(-30);
    const recentLows = lows.slice(-30);
    let trend = 0;
    for (let i = 1; i < recentHighs.length; i++) {
      if (recentHighs[i] > recentHighs[i - 1]) trend += 0.03;
      else trend -= 0.02;
      if (recentLows[i] > recentLows[i - 1]) trend += 0.02;
      else trend -= 0.03;
    }
    return Math.max(-1, Math.min(1, trend));
  }

  analyzeSupportResistance(candles) {
    if (candles.length < 30) return 0;
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    const resistanceLevel = Math.max(...highs.slice(-30));
    const supportLevel = Math.min(...lows.slice(-30));
    const currentPrice = closes[closes.length - 1];
    let srScore = 0;
    const rangeTolerance = (resistanceLevel - supportLevel) * 0.02;
    if (Math.abs(currentPrice - resistanceLevel) < rangeTolerance) srScore += 0.5;
    if (Math.abs(currentPrice - supportLevel) < rangeTolerance) srScore += 0.5;
    return Math.min(srScore, 1);
  }

  analyzeRBS(candles) {
    if (candles.length < 20) return 0;
    const closes = candles.map(c => c.close);
    const recentCloses = closes.slice(-20);
    const avgPrice = recentCloses.reduce((a, b) => a + b) / recentCloses.length;
    let breaks = 0;
    for (let i = 1; i < recentCloses.length; i++) {
      if ((recentCloses[i] > avgPrice && recentCloses[i - 1] < avgPrice) ||
          (recentCloses[i] < avgPrice && recentCloses[i - 1] > avgPrice)) {
        breaks += 1;
      }
    }
    return Math.min(breaks / 20, 1);
  }

  analyzeSBR(candles) {
    if (candles.length < 50) return 0;
    const volumes = candles.map(c => c.volume || 1);
    const avgVolume = volumes.reduce((a, b) => a + b) / volumes.length;
    const recentVolume = volumes[volumes.length - 1];
    let breakerScore = 0;
    if (recentVolume > avgVolume * 1.5) breakerScore += 0.5;
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const recentRange = Math.max(...highs.slice(-10)) - Math.min(...lows.slice(-10));
    const avgRange = this.getAverageRange(candles);
    if (recentRange < avgRange * 0.5) breakerScore += 0.5;
    return Math.min(breakerScore, 1);
  }

  analyzeConfluence(candles) {
    if (candles.length < 30) return 0;
    let confluencePoints = 0;
    const msrnScore = Math.abs(this.analyzeMSNR(candles));
    if (msrnScore > 0.5) confluencePoints += 0.3;
    const rbsScore = this.analyzeRBS(candles);
    if (rbsScore > 0.5) confluencePoints += 0.3;
    const srScore = this.analyzeSupportResistance(candles);
    if (srScore > 0.5) confluencePoints += 0.4;
    return Math.min(confluencePoints, 1);
  }

  analyzeCRT(candles) {
    if (candles.length < 30) return 0;
    let rejections = 0;
    const recentCandles = candles.slice(-10);
    for (const candle of recentCandles) {
      const bodySize = Math.abs(candle.close - candle.open);
      const wickSize = Math.max(
        candle.high - Math.max(candle.open, candle.close),
        Math.min(candle.open, candle.close) - candle.low
      );
      if (wickSize > bodySize * 2) rejections += 0.1;
    }
    return Math.min(rejections, 1);
  }

  determineSignalType(candleData, intradayScore, shortTermScore, mediumTermScore) {
    const bullishScores = [intradayScore, shortTermScore, mediumTermScore].filter(s => s > 0).length;
    const bearishScores = [intradayScore, shortTermScore, mediumTermScore].filter(s => s < 0).length;
    if (bullishScores > bearishScores && intradayScore > 0) return 'BUY';
    if (bearishScores > bullishScores && intradayScore < 0) return 'SELL';
    return null;
  }

  calculateLevels(symbol, candleData, signalType) {
    const tfForLevels = candleData['4h'] || candleData['1h'] || candleData['30m'];
    if (!tfForLevels) return { entry: 0, stopLoss: 0, takeProfit: 0 };
    const candles = tfForLevels;
    const lastCandle = candles[candles.length - 1];
    const avgRange = this.getAverageRange(candles) * 2;
    let entry, stopLoss, takeProfit;
    if (signalType === 'BUY') {
      entry = lastCandle.close;
      stopLoss = entry - avgRange;
      takeProfit = entry + (avgRange * 4);
    } else {
      entry = lastCandle.close;
      stopLoss = entry + avgRange;
      takeProfit = entry - (avgRange * 4);
    }
    return { entry, stopLoss, takeProfit };
  }

  getPrimaryTimeframe(signalType) {
    return '4h';
  }

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
      const delta = deltas[i];
      const gain = delta > 0 ? delta : 0;
      const loss = delta < 0 ? -delta : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    return rsi;
  }

  getAverageRange(candles, period = 20) {
    const ranges = candles.slice(-period).map(c => c.high - c.low);
    return ranges.reduce((a, b) => a + b, 0) / ranges.length;
  }
}

module.exports = SignalEngine;
