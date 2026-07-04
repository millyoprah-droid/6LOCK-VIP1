/**
 * 6lock VIP1 - Advanced Forex Trading Bot
 * Main Bot Engine - Orchestrates signal generation and trade execution
 */

require('dotenv').config();
const express = require('express');
const SignalEngine = require('./signalEngine');
const TradingViewAPI = require('./tradingviewAPI');
const RiskManager = require('./riskManager');
const AlertSystem = require('./alertSystem');
const Logger = require('./utils/logger');

class TradingBot {
  constructor() {
    this.app = express();
    this.signalEngine = new SignalEngine();
    this.tradingView = new TradingViewAPI();
    this.riskManager = new RiskManager();
    this.alertSystem = new AlertSystem();
    this.logger = new Logger();
    this.activeSignals = [];
    this.activeTrades = [];
    this.isRunning = false;
    
    // Configuration
    this.config = {
      confidenceThreshold: parseInt(process.env.CONFIDENCE_THRESHOLD) || 80,
      riskRewardRatio: parseFloat(process.env.RISK_REWARD_RATIO) || 4,
      baseRiskPercent: parseFloat(process.env.BASE_RISK_PERCENT) || 1,
      timeframes: (process.env.TIMEFRAMES || '15m,30m,1h,2h,4h,1d,1w').split(','),
      updateInterval: 60000, // Update every minute
      forexPairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'NZDUSD', 'USDCAD', 'USDCHF']
    };

    this.setupServer();
  }

  setupServer() {
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // API Routes
    this.app.get('/api/signals', (req, res) => {
      res.json({
        signals: this.activeSignals,
        trades: this.activeTrades,
        status: this.isRunning ? 'running' : 'stopped'
      });
    });

    this.app.get('/api/status', (req, res) => {
      res.json({
        status: this.isRunning ? 'running' : 'stopped',
        activeTrades: this.activeTrades.length,
        activeSignals: this.activeSignals.length,
        config: this.config
      });
    });

    this.app.post('/api/webhook/signal', (req, res) => {
      this.handleWebhookSignal(req.body);
      res.json({ success: true });
    });

    this.app.listen(process.env.PORT || 3000, () => {
      this.logger.log(`🚀 Dashboard running on http://localhost:${process.env.PORT || 3000}`);
    });
  }

  async start() {
    this.logger.log('🤖 Starting 6lock VIP1 Trading Bot...', 'info');
    this.isRunning = true;

    try {
      // Connect to TradingView
      await this.tradingView.connect();
      this.logger.log('✅ Connected to TradingView', 'success');
      this.monitoringLoop();
    } catch (error) {
      this.logger.log(`❌ Failed to start bot: ${error.message}`, 'error');
      this.isRunning = false;
    }
  }

  async monitoringLoop() {
    while (this.isRunning) {
      try {
        for (const pair of this.config.forexPairs) {
          await this.analyzeSymbol(pair);
        }
        await new Promise(resolve => setTimeout(resolve, this.config.updateInterval));
      } catch (error) {
        this.logger.log(`❌ Monitoring loop error: ${error.message}`, 'error');
      }
    }
  }

  async analyzeSymbol(symbol) {
    try {
      this.logger.log(`📊 Analyzing ${symbol}...`, 'info');
      const candleData = {};

      for (const timeframe of this.config.timeframes) {
        const candles = await this.tradingView.getCandles(symbol, timeframe, 100);
        candleData[timeframe] = candles;
      }

      const signal = await this.signalEngine.generateSignal(symbol, candleData);
      if (signal && signal.confidence >= this.config.confidenceThreshold) {
        this.processSignal(signal);
      }
    } catch (error) {
      this.logger.log(`Error analyzing ${symbol}: ${error.message}`, 'error');
    }
  }

  processSignal(signal) {
    signal.timestamp = new Date();
    signal.id = `${signal.symbol}_${Date.now()}`;

    const rr = this.riskManager.calculateRiskReward(
      signal.entry,
      signal.stopLoss,
      signal.takeProfit,
      this.config.riskRewardRatio
    );

    signal.riskReward = rr;
    this.activeSignals.push(signal);

    const signalColor = signal.type === 'BUY' ? '🟢 GREEN' : '🔴 PINK';
    this.logger.log(
      `\n${'='.repeat(60)}
${signalColor} SIGNAL DETECTED
${'='.repeat(60)}
📍 Symbol: ${signal.symbol}
⏱️  Timeframe: ${signal.timeframe}
💪 Confidence: ${signal.confidence}%
📈 Entry: ${signal.entry.toFixed(5)}
🛑 Stop Loss: ${signal.stopLoss.toFixed(5)}
🎁 Take Profit: ${signal.takeProfit.toFixed(5)}
📊 Risk/Reward: 1:${signal.riskReward.ratio.toFixed(2)}
${'='.repeat(60)}\n`,
      signal.type === 'BUY' ? 'green' : 'magenta'
    );

    this.alertSystem.sendAlert(signal);

    if (process.env.AUTO_TRADE === 'true') {
      this.executeTrade(signal);
    }

    if (this.activeSignals.length > 100) {
      this.activeSignals.shift();
    }
  }

  async executeTrade(signal) {
    try {
      const positionSize = this.riskManager.calculatePositionSize(
        signal.entry,
        signal.stopLoss,
        this.config.baseRiskPercent
      );

      const trade = {
        id: signal.id,
        signal: signal,
        positionSize: positionSize,
        status: 'pending',
        executedAt: new Date(),
        pnl: 0
      };

      this.activeTrades.push(trade);
      this.logger.log(`📝 Trade registered: ${signal.symbol} ${signal.type}`, 'success');
    } catch (error) {
      this.logger.log(`Trade execution error: ${error.message}`, 'error');
    }
  }

  handleWebhookSignal(data) {
    this.logger.log(`📨 Webhook signal received: ${data.signal}`, 'info');
  }

  stop() {
    this.logger.log('🛑 Stopping bot...', 'info');
    this.isRunning = false;
  }

  getStatus() {
    return {
      running: this.isRunning,
      activeTrades: this.activeTrades.length,
      activeSignals: this.activeSignals.length,
      config: this.config
    };
  }
}

const bot = new TradingBot();
bot.start();

process.on('SIGINT', () => {
  bot.stop();
  process.exit(0);
});

module.exports = TradingBot;
