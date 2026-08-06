# PRD: Dilo — Natural Language Financial Actions on Solana

**Hackathon:** Superteam x QuickNode  
**Product:** Dilo  
**Team:** The Recursion  
**Status:** Hackathon MVP  
**Repo:** https://github.com/developmentjgonz/cursor-build-v1  
**Live demo:** https://cursor-build-v1.vercel.app

## Overview

**Dilo** is a natural-language interface for financial actions on Solana.

Instead of navigating wallets, DEXs, prediction markets, token pairs, routes, slippage, and fees, users simply describe what they want to do.

Examples:

> “Swap $5 of SOL into USDC.”

> “Cambia el 10% de mi SOL a USDC.”

> “Put $2 on YES that this event happens.”

Dilo understands the user's intent, retrieves real blockchain and market data, shows exactly what will happen, and lets the user approve and sign the transaction from their own wallet.

**One-line pitch:**

**Say what you want to do on Solana. Review it. Sign it. Done.**

---

## Problem

Solana is fast and inexpensive, but interacting with it is still designed primarily for crypto-native users.

Users are expected to understand:

* Wallets
* Tokens
* DEX interfaces
* Slippage
* Routes
* Transaction fees
* Prediction-market interfaces
* Blockchain signing

Most people don't care about the infrastructure.

They care about outcomes:

> “Put $10 into SOL.”

> “Convert 20% of my SOL to USDC.”

> “Put $5 on YES for this prediction.”

Dilo removes the gap between **human intent** and an **on-chain financial action**.

---

## Solution

Dilo acts as an **intent layer for Solana**.

The AI interprets what the user wants and converts it into a structured action.

Deterministic application logic validates the request and uses QuickNode and integrated Solana protocols to prepare the transaction.

Before anything happens, Dilo displays an **Intent Receipt** explaining:

* What action will occur
* How much will be spent
* What the user will receive
* Price or probability
* Fees
* Relevant conditions

The user then explicitly approves and signs the transaction.

Dilo never controls the user's private keys.

---

## Hackathon MVP

The MVP demonstrates two natural-language actions.

### 1. Token Swap

Example:

> “Convert 10% of my SOL to USDC, but only if price impact is below 0.5%.”

Dilo:

1. Reads the wallet balance
2. Calculates the amount
3. Gets a live Metis/Jupiter quote
4. Checks the user's condition
5. Displays an Intent Receipt
6. Requests wallet approval
7. Broadcasts and confirms the transaction

### 2. Prediction Market

Example:

> “Put $2 on YES that [event] happens.”

Dilo:

1. Identifies the prediction market
2. Retrieves the current YES/NO pricing
3. Calculates the position
4. Displays the potential outcome
5. Shows an Intent Receipt
6. User signs the transaction
7. Position is executed on Solana

Prediction-market execution uses DFlow/Kalshi infrastructure with Solana settlement. A verified/eligible wallet is required for live prediction-market trading.

---

## Core Experience

### Connect

User connects Phantom.

### Ask

User enters a financial action naturally in English or Spanish.

### Understand

Dilo converts the request into structured intent.

### Quote

QuickNode and the appropriate protocol retrieve live transaction data.

### Review

Dilo displays the **Intent Receipt**.

### Approve

User explicitly confirms the action.

### Sign

Phantom opens and the user signs locally.

### Confirm

QuickNode broadcasts and confirms the Solana transaction.

Dilo returns a confirmation and explorer link.

---

## QuickNode Integration

### Solana RPC

Used for:

* Wallet balances
* Blockchain reads
* Transaction submission
* Transaction confirmation
* Updated wallet state

### Metis / Jupiter

Used for:

* Swap quotes
* Routing
* Expected output
* Price impact
* Swap transaction construction

### Prediction Markets

DFlow provides access to prediction-market positions that can be executed through Solana.

QuickNode remains the Solana infrastructure layer for wallet state, transaction broadcast, and confirmation.

### Priority Fee API

Optional enhancement for transaction fee optimization.

---

## AI & Safety

The AI is an **intent interpreter**, not an autonomous trader.

It can:

* Understand English and Spanish
* Interpret token amounts
* Interpret wallet percentages
* Understand conditions
* Identify prediction-market intent
* Explain the resulting action

It cannot:

* Access private keys
* Sign transactions
* Approve actions
* Override safety limits
* Move funds independently

Every action requires:

**Intent → Validation → Receipt → Explicit Approval → Wallet Signature**

---

## Live Demo

### Demo 1

Connect Phantom and enter:

> “Cambia el 10% de mi SOL a USDC, pero no lo hagas si el impacto supera 0.5%.”

Dilo retrieves the live quote, displays the Intent Receipt, and completes the signed Solana transaction.

### Demo 2 / Wow Moment

Enter:

> “Put $2 on YES that [live prediction] happens.”

Dilo finds the market, displays the current probability, cost, and potential payout, then prepares the Solana transaction for wallet approval.

---

## Vision

The long-term vision is broader than trading.

Dilo becomes a universal natural-language interface for Solana:

> “Send Diana $20.”

> “Stake 5 SOL.”

> “Swap half my SOL into USDC.”

> “Put $5 on YES for this prediction.”

> “Buy $10 of SOL if it falls below $150.”

Eventually the onboarding experience becomes:

**Sign in → wallet automatically created → add USD → tell Dilo what you want.**

Users should not have to learn every crypto interface.

They should simply describe the outcome they want, understand the resulting action, and approve it.

## Core Thesis

**Solana solved transaction speed. Dilo solves the human interface.**

---

## Team Work Split

The three-person team will work in parallel across one shared experience layer and two vertical product slices.

### Person 1 — UI and Intent System

* Build the Dilo interface and natural-language input
* Parse English and Spanish intents
* Define shared intent types and deterministic validation
* Build the Intent Receipt
* Manage the ask → quote → review → sign → confirm flow
* Create mocked versions of both demos so integrations can proceed independently

### Person 2 — Wallet and Live Swap

* Integrate Phantom connection and signing
* Read wallet balances through QuickNode
* Retrieve Jupiter/Metis swap quotes
* Calculate percentage-based amounts and enforce price-impact conditions
* Build, broadcast, and confirm swap transactions
* Own the guaranteed live swap demo

### Person 3 — Prediction Markets and Backend

* Search DFlow/Kalshi markets and retrieve live pricing
* Calculate YES/NO positions and potential outcomes
* Prepare prediction-market transactions
* Build serverless API routes and protect service credentials
* Check wallet eligibility
* Provide a clearly labeled simulated fallback if live execution is unavailable

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
