/**
 * Risk Manager - Handles risk/reward calculations and position sizing
 */

const Logger = require('./utils/logger');

class RiskManager {
  constructor() {
    this.logger = new Logger();
  }

  calculateRiskReward(entry, stopLoss, takeProfit, riskRewardRatio) {
    const riskAmount = Math.abs(entry - stopLoss);
    const rewardAmount = Math.abs(takeProfit - entry);
    const actualRatio = rewardAmount / riskAmount;

    return {
      riskAmount,
      rewardAmount,
      ratio: actualRatio,
      isValid: actualRatio >= (riskRewardRatio * 0.9)
    };
  }

  calculatePositionSize(entry, stopLoss, riskPercentage) {
    const riskAmount = Math.abs(entry - stopLoss);
    const positionSize = (riskPercentage / 100) / riskAmount;
    return Math.round(positionSize * 1000) / 1000;
  }

  validateTrade(entry, stopLoss, takeProfit, minRatio = 1) {
    if (entry === stopLoss || entry === takeProfit) {
      return { valid: false, reason: 'Entry equals stop loss or take profit' };
    }

    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    const ratio = reward / risk;

    if (ratio < minRatio) {
      return { valid: false, reason: `Risk/Reward ratio ${ratio.toFixed(2)} below minimum ${minRatio}` };
    }

    return { valid: true, ratio };
  }
}

module.exports = RiskManager;
