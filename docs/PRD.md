# PRD: Natural Language Trading on Solana

**Team:** Rucrsion  
**Repo:** https://github.com/developmentjgonz/cursor-build-v1  
**Live demo:** https://cursor-build-v1.vercel.app

## Product

**Working name:** Solana Agent

**One-line pitch:**
Talk to your wallet. Ask for a trade in plain English, review the transaction, and sign it yourself.

## Problem

Trading tokens on Solana still requires users to understand wallets, token pairs, DEX interfaces, slippage, routing, and transaction fees.

For someone who simply wants to say:

> “Swap $10 of SOL for USDC.”

the experience is unnecessarily complicated.

At the same time, many AI crypto products stop at answering questions instead of actually interacting with the blockchain.

## Solution

Build an AI-native Solana wallet interface where users can perform basic trading actions using natural language.

The user connects their wallet and can say things like:

* “How much SOL do I have?”
* “What's SOL worth right now?”
* “Swap $10 of SOL into USDC.”
* “How much BONK can I get for 0.1 SOL?”

The AI understands the request and uses QuickNode to retrieve blockchain data and generate a real trade.

Before anything happens, the user sees exactly what will occur.

The user's wallet always signs the transaction.

The application never controls private keys.

## Core Flow

### 1. Connect wallet

User connects Phantom or Backpack.

The application displays the wallet address and SOL balance.

### 2. Ask

User enters:

> “Swap $10 of SOL into USDC.”

### 3. Understand

The AI converts the request into a structured action:

* Input token: SOL
* Output token: USDC
* Amount: approximately $10
* Action: Swap

### 4. Quote

QuickNode + Metis/Jupiter returns the best available swap quote.

The application shows:

* Amount being spent
* Estimated amount received
* Price impact
* Swap route
* Network / priority fee

### 5. Confirm

The agent asks:

> “You will swap approximately 0.07 SOL for 10 USDC. Price impact is 0.01%. Confirm?”

The transaction cannot proceed without explicit confirmation.

### 6. Sign

The transaction is prepared and sent to the connected wallet.

Phantom/Backpack asks the user to sign.

The application never receives the user's private key.

### 7. Execute

The signed transaction is submitted through QuickNode's Solana RPC.

### 8. Confirm

The application monitors the transaction until confirmation and returns:

> “Trade complete ✓”

along with a Solscan link.

## MVP

The hackathon version supports only four actions:

1. Connect wallet
2. Check wallet balance
3. Get a token/swap quote
4. Execute a token swap

Example commands:

> “What's in my wallet?”

> “What's SOL trading at?”

> “Swap 0.1 SOL for USDC.”

> “Swap $5 of SOL for BONK.”

No autonomous trading is required.

## AI Agent

The language model acts as an intent and reasoning layer.

Available tools:

* `getWalletBalance`
* `getTokenPrice`
* `getSwapQuote`
* `prepareSwap`
* `checkTransaction`

The model never directly signs transactions.

Blockchain actions are deterministic application functions exposed to the model as tools.

## QuickNode Integration

QuickNode provides the blockchain execution infrastructure.

### Solana RPC

Used for:

* wallet balances
* blockchain reads
* sending transactions
* transaction confirmation

### Metis / Jupiter

Used for:

* swap quotes
* routing
* price impact
* swap transaction generation

### Priority Fee API

Optional enhancement used to estimate an appropriate transaction priority fee.

## Safety

The system is non-custodial.

* Private keys never leave the user's wallet.
* Every trade requires explicit user confirmation.
* Every transaction requires wallet signature.
* Trade details are displayed before signing.
* The demo can enforce a maximum transaction value.

The AI can propose actions but cannot move funds independently.

## Tech Stack

**Frontend**

* Next.js
* TypeScript
* Tailwind
* Solana Wallet Adapter

**AI**

* Claude or another tool-calling LLM

**Blockchain**

* Solana
* QuickNode RPC
* QuickNode Metis / Jupiter

**Hosting**

* Vercel

## Demo

The ideal hackathon demo takes less than 60 seconds.

User connects Phantom.

User types:

> “Swap $5 of SOL into USDC.”

The agent retrieves a real quote.

It explains:

> “You'll spend approximately 0.035 SOL and receive approximately $5 USDC with 0.01% price impact.”

User presses **Confirm**.

Phantom opens.

User signs.

The transaction executes.

The agent responds:

> “Done ✓ Your SOL was swapped for USDC.”

A Solscan transaction link appears.

## Vision

Today the application supports swaps.

Long term, the same natural-language transaction layer could support:

> “Stake 5 SOL.”

> “Send Diana $20 in USDC.”

> “Buy $25 of BONK.”

> “Swap half my BONK into SOL.”

> “Show me what changed in my wallet today.”

> “Create a limit order to buy SOL if it drops below $150.”

Instead of learning every Solana application individually, users describe what they want to accomplish and the agent translates that intent into transparent, user-approved blockchain transactions.

## Success

A successful hackathon demo proves one thing:

**A user can go from a sentence to a completed on-chain Solana transaction in seconds, without giving an AI custody of their wallet.**
