# Dilo

Team **The Recursion** — natural-language financial actions on Solana.

**Say what you want to do on Solana. Review it. Sign it. Done.**

## Product

- [PRD](./docs/PRD.md) — Dilo (Superteam x QuickNode hackathon MVP)

## Links

- Repo: https://github.com/developmentjgonz/cursor-build-v1
- Production: https://cursor-build-v1.vercel.app

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Team Work Split

The three-person team will work in parallel across one shared experience layer and two vertical product slices.

### Person 1 — UI and Intent System

- Build the Dilo interface and natural-language input
- Parse English and Spanish intents
- Define shared intent types and deterministic validation
- Build the Intent Receipt
- Manage the ask → quote → review → sign → confirm flow
- Create mocked versions of both demos so integrations can proceed independently

### Person 2 — Wallet and Live Swap

- Integrate Phantom connection and signing
- Read wallet balances through QuickNode
- Retrieve Jupiter/Metis swap quotes
- Calculate percentage-based amounts and enforce price-impact conditions
- Build, broadcast, and confirm swap transactions
- Own the guaranteed live swap demo

### Person 3 — Prediction Markets and Backend

- Search DFlow/Kalshi markets and retrieve live pricing
- Calculate YES/NO positions and potential outcomes
- Prepare prediction-market transactions
- Build serverless API routes and protect service credentials
- Check wallet eligibility
- Provide a clearly labeled simulated fallback if live execution is unavailable

### Shared Contracts

Before parallel implementation begins, the team will agree on the shared `Intent`, `Quote`, and `IntentReceipt` interfaces. Each workstream will implement against these contracts and use fixtures until its live integration is ready.

### Integration Order

1. Define the shared contracts
2. Build both flows with mocked data
3. Implement wallet connectivity and the live swap path
4. Integrate the live swap into the shared interface
5. Integrate prediction-market lookup and pricing
6. Add live prediction execution if wallet eligibility permits
7. Harden loading, error, mobile, and transaction-confirmation states
8. Rehearse both demo flows

The live swap is the required end-to-end demo. Live prediction execution is a stretch goal because it depends on external wallet eligibility and protocol access.
