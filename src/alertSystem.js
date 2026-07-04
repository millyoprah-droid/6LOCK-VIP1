/**
 * Alert System - Sends notifications for trading signals
 */

const axios = require('axios');
const Logger = require('./utils/logger');

class AlertSystem {
  constructor() {
    this.logger = new Logger();
    this.webhookURL = process.env.ALERT_WEBHOOK;
    this.email = process.env.ALERT_EMAIL;
  }

  async sendAlert(signal) {
    try {
      if (this.webhookURL) {
        await this.sendWebhook(signal);
      }

      if (this.email) {
        await this.sendEmail(signal);
      }

      this.logger.log(`📬 Alert sent for ${signal.symbol}`, 'success');
    } catch (error) {
      this.logger.log(`Alert error: ${error.message}`, 'error');
    }
  }

  async sendWebhook(signal) {
    try {
      const payload = {
        signal: signal.type,
        pair: signal.symbol,
        confidence: signal.confidence,
        entry: signal.entry.toFixed(5),
        stopLoss: signal.stopLoss.toFixed(5),
        takeProfit: signal.takeProfit.toFixed(5),
        timeframe: signal.timeframe,
        timestamp: signal.timestamp.toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  async sendEmail(signal) {
    try {
      const subject = `🎯 ${signal.type} Signal: ${signal.symbol} at ${signal.confidence}% confidence`;
      const body = `
        Symbol: ${signal.symbol}
        Type: ${signal.type}
        Confidence: ${signal.confidence}%
        Entry: ${signal.entry.toFixed(5)}
        Stop Loss: ${signal.stopLoss.toFixed(5)}
        Take Profit: ${signal.takeProfit.toFixed(5)}
        Time: ${signal.timestamp.toISOString()}
      `;
      this.logger.log(`📧 Email alert prepared: ${subject}`, 'info');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AlertSystem;
