# 🔒 6lock VIP1 - Advanced Forex Trading Bot

A high-performance, multi-timeframe forex trading bot with advanced technical analysis signals. Features real-time signal generation based on market structure, support/resistance, liquidity analysis, and smart money concepts.

## ✨ Features

- **🎯 Multi-Timeframe Analysis**: Analyzes 15min, 30min, 1hr, 2hr, 4hr, daily, and weekly timeframes
- **🚀 Fast Signal Generation**: Real-time signal processing with minimal latency
- **📊 Advanced Indicators**: MSNR, Resistance/Support, Liquidity Zones, SBR, RBS, QM, CRT
- **🎨 Visual Signals**: Pink (Sell) and Green (Buy) signals with 80% confidence threshold
- **📈 Smart Risk Management**: 1:4 Risk/Reward ratio with automated position sizing
- **📱 Three-Step Analysis**: Intraday → Short-term → Medium-term signal confirmation
- **🔗 TradingView Integration**: Real-time market data via TradingView API
- **📡 Webhook Alerts**: Instant notifications for new trading signals
- **🖥️ Dashboard UI**: Beautiful real-time trading dashboard with pink/green theme

## 📋 Requirements

- Node.js v16+
- npm or yarn
- TradingView API credentials
- Broker API credentials (Binance, Bybit, etc.)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/millyoprah-droid/6LOCK-VIP1.git
cd 6LOCK-VIP1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API credentials
```

### 4. Start the Bot
```bash
npm start
```

## 📁 Project Structure

```
6LOCK-VIP1/
├── src/
│   ├── bot.js                    # Main bot engine
│   ├── signalEngine.js           # Signal generation logic
│   ├── indicators.js             # Technical analysis indicators
│   ├── tradingviewAPI.js         # TradingView integration
│   ├── riskManager.js            # Risk/Reward calculations
│   ├── alertSystem.js            # Notifications & alerts
│   └── utils/
│       └── logger.js             # Logging utility
├── public/
│   ├── index.html                # Dashboard HTML
│   ├── styles.css                # Pink & Green theme
│   └── app.js                    # Frontend logic
├── config/
│   └── timeframes.js             # Timeframe configuration
├── tests/
│   └── signals.test.js           # Unit tests
├── .env.example                  # Environment template
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

## 🎯 Signal Logic - Three-Step Analysis

### Confidence Scoring System
Signals are generated when confidence reaches **80%** threshold:

1. **Intraday Analysis** (15min, 30min) - 40%
   - Liquidity zones analysis
   - Momentum indicators (RSI)
   - Breakout detection

2. **Short-term Analysis** (1hr, 2hr, 4hr) - 30%
   - Market Structure (MSNR)
   - Support/Resistance levels
   - RBS (Risk/Break Structure)

3. **Medium-term Analysis** (Daily, Weekly) - 30%
   - Smart Money Breaker (SBR)
   - Confluence & Rejection Trading (CRT)
   - Quality/Momentum (QM)

**Total Score = (Intraday × 0.40) + (Short-term × 0.30) + (Medium-term × 0.30)**

### Signal Types

- **🟢 GREEN (BUY)**: Bullish confluence with 80%+ confidence
- **🔴 PINK (SELL)**: Bearish confluence with 80%+ confidence

## 📊 Technical Indicators Used

- **MSNR** (Market Structure & Supply/Demand)
- **Support & Resistance Levels** (Key price levels)
- **Liquidity Zones** (Order blocks, breaker blocks)
- **SBR** (Smart Break Reversal)
- **RBS** (Risk/Break Structure)
- **QM** (Quality/Momentum)
- **CRT** (Confluence & Rejection Trading)
- **RSI** (Relative Strength Index)

## 💰 Risk Management

- **Risk/Reward Ratio**: Fixed 1:4 ratio
- **Position Sizing**: Automatic based on account risk percentage
- **Stop Loss**: Placed 1 unit below entry
- **Take Profit**: Placed 4 units above entry
- **Max Daily Loss**: Configurable stop-out level

## 🔗 API Integration

### TradingView
- Real-time candlestick data
- Technical indicator calculations
- WebSocket streaming for live updates

### Broker APIs
- Trade execution
- Position management
- Account balance monitoring

## 📡 Webhook Configuration

Receive instant alerts when signals are generated:

```json
POST /api/webhook/signal
{
  "signal": "BUY|SELL",
  "pair": "EURUSD",
  "confidence": 85,
  "entry": 1.0850,
  "stopLoss": 1.0840,
  "takeProfit": 1.0890,
  "timeframe": "4h",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

## 🖥️ Dashboard

Access the real-time dashboard at `http://localhost:3000`

Features:
- 🟢 Live GREEN (BUY) signals
- 🔴 Live PINK (SELL) signals
- Multi-timeframe analysis charts
- Confidence scoring breakdown
- Active trades monitoring
- Real-time P&L tracking
- Pink & Green color theme

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run backtests:
```bash
npm run backtest
```

## ⚠️ Disclaimer

This bot is for **educational purposes only**. Always use proper risk management. The developers are not responsible for any losses incurred. Test extensively on **demo accounts** before live trading.

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact: millyoprah-droid

## 📄 License

MIT License - See LICENSE file for details

---

**Happy Trading! 🚀📈**
