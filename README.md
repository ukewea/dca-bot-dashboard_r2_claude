# Crypto DCA Dashboard

A lightweight web UI that renders simulated DCA portfolio data from files written by the bot, without requiring a database.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

### Production Deployment

The dashboard reads data from these files:
- `positions_current.json` - Current portfolio positions
- `snapshots.ndjson` - Historical snapshots for charts
- `transactions.ndjson` - Transaction history (optional)
- `prices.ndjson` - Price data (optional)
- `iterations.ndjson` - Bot iterations (optional)

## 📊 Features

- **Dashboard**: Real-time portfolio overview with P/L tracking
- **Charts**: Interactive performance visualization with asset filtering
- **Transactions**: Complete trade history with filtering
- **Themes**: Light/Dark mode with system preference detection
- **Responsive**: Mobile-friendly design

## 🔧 Configuration

### Build-time Configuration
Set environment variable:
```bash
VITE_DATA_BASE_PATH="/path/to/data"
```

### Runtime Configuration
Create `public/app-config.json`:
```json
{
  "dataBasePath": "/data"
}
```

## 🌐 GitHub Pages Deployment

1. **Enable GitHub Pages** in your repository settings
2. **Set source** to "GitHub Actions"
3. **Push to main branch** - the workflow will automatically build and deploy

The site will be available at: `https://yourusername.github.io/dca-bot-dashboard_r2_claude/`

### Manual GitHub Pages Setup

1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select "gh-pages" branch
4. The workflow will create this branch automatically

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Dashboard, Charts, Transactions
│   ├── lib/                # Data readers, utilities, theme context
│   ├── types/              # TypeScript interfaces
├── public/
│   ├── data/               # Bot data files (positions, snapshots, etc.)
│   └── app-config.json     # Runtime configuration
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment
└── dist/                   # Built files (generated)
```

## 🔒 Data Contracts

The dashboard expects these file formats from the DCA bot:

### positions_current.json
```json
{
  "updated_at": "2025-08-27T12:21:03Z",
  "base_currency": "USDC", 
  "total_quote_invested": "682.74",
  "positions": [
    {
      "symbol": "BTCUSDC",
      "open_quantity": "0.001",
      "total_cost": "122.16"
    }
  ]
}
```

### snapshots.ndjson
```json
{"ts":"2025-08-27T10:21:03Z","base_currency":"USDC","total_quote_invested":"620.75","total_market_value":"626.37","total_unrealized_pl":"5.62","positions":[{"symbol":"ETHUSDC","open_qty":"0.0223","total_cost":"102.11","price":"4601.8","market_value":"102.62","unrealized_pl":"0.51"}]}
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router v6
- **Deployment**: GitHub Actions + GitHub Pages

## 📈 Performance

- Fast dashboard load (<500ms on typical LAN)
- Automatic data refresh every 30 seconds
- Optimized NDJSON parsing with error tolerance
- Client-side chart data processing

## 🔧 Browser Support

- Modern browsers with ES2020 support
- Chrome 87+, Firefox 78+, Safari 14+
- Mobile responsive design