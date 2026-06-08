# PortfolioIQ — Smart Asset Manager

A full-stack portfolio analysis web app for Indian investors, inspired by Groww and Zerodha Kite.

## Features

- **CSV Upload** — Import holdings from CDSL, NSDL, Zerodha, Groww, or any broker
- **Guest Analysis** — Basic analysis without signup (returns, allocation, index comparison)
- **Full Analysis** (logged in) — Momentum scores, fundamentals (P/E, ROE, debt), smart suggestions
- **Benchmark Comparison** — Compare against NIFTY 50 and Sensex
- **Smart Suggestions** — Rebalancing, diversification, and allocation recommendations
- **Portfolio Management** — Save and track multiple portfolios

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Recharts
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) — swap to PostgreSQL for production
- **Auth**: JWT-based sessions with bcrypt password hashing

## Getting Started

```bash
# Install dependencies
npm install

# Set up database
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Try It

1. Go to **Analyze** and upload `public/sample-holdings.csv` for instant basic analysis
2. **Sign up** for free to unlock momentum, fundamentals, and smart suggestions
3. **Save portfolios** from the Portfolio page for ongoing tracking

## CSV Format

The parser auto-detects common column names:

| Field | Accepted Column Names |
|-------|----------------------|
| Symbol | symbol, scrip, ticker, trading symbol |
| Name | name, company, company name |
| Quantity | quantity, qty, shares, units |
| Price | avg price, average price, buy price, cost price |

## Project Structure

```
src/
├── app/                  # Pages & API routes
│   ├── api/              # Auth, analyze, portfolio endpoints
│   ├── analyze/          # Guest + auth CSV analysis
│   ├── dashboard/        # User dashboard
│   ├── portfolio/        # Upload & save portfolios
│   ├── login/ signup/    # Authentication
│   └── support/          # Help & FAQ
├── components/           # UI components
│   ├── analysis/         # Charts, tables, upload
│   ├── layout/           # Navbar, footer
│   └── ui/               # Button, input, card
└── lib/                  # Core logic
    ├── analysis.ts       # Portfolio analysis engine
    ├── csv-parser.ts     # Multi-format CSV parser
    ├── market-data.ts    # Stock fundamentals database
    └── auth.ts           # JWT authentication
```

## Disclaimer

PortfolioIQ is for educational purposes only. Not SEBI-registered investment advice. Market data in this demo is illustrative.
