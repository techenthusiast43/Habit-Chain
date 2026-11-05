# ⛓️ HabitChain

> A lightweight Web3 decentralized habit tracker deployed on the **BOT Chain** network.

Users connect their EVM wallet, create daily habits, and record daily check-ins permanently on the blockchain with built-in daily duplicate prevention, real-time streak computation, and a 7-day visual calendar.

---

## 🚀 Network Specifications (BOT Chain Testnet)

- **Network Name**: BOT Chain Testnet
- **Chain ID**: `968`
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Native Currency**: `BOT` (18 Decimals)
- **Total Supply**: 150 Million
- **Block Explorer**: [https://scan.bohr.life/](https://scan.bohr.life/)

---

## 🌟 Key Features

1. **MetaMask & EVM Wallet Connect**: Powered by **@reown/appkit**, **Wagmi v2**, and **Viem**.
2. **Custom Habit Creation**: Users can define and track habits with custom titles (length-validated & empty names rejected).
3. **Wallet Habit Isolation**: Each habit strictly belongs to its creator. Non-owners cannot check in, alter, or delete others' habits.
4. **On-Chain Daily Check-In**:
   - Enforces strictly **1 check-in per UTC day** using `block.timestamp / 1 days`.
   - Reverts duplicate check-in attempts on the same day.
5. **Habit Lifecycle Control**: Seamlessly activate, pause (deactivate), and delete habits.
6. **Dynamic Streak Calculation**: Streaks are calculated directly on the client side from verified on-chain timestamp history to optimize gas efficiency.
7. **Weekly 7-Day Visual Calendar**: Visual status pills for the past 7 days indicating completed days, missed days, and today's status.
8. **Transaction Tracker**: Displays verified transaction hashes with direct links to BOHR Scan.
9. **Clean Real-Time Dashboard**: Summary metrics for total active habits, today's completion rate percentage, best streaks, and total verified blocks.

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity `^0.8.20`, Hardhat, Hardhat Toolbox, Chai
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Web3 Integration**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, `viem`, `@tanstack/react-query`

---

## 📁 Project Structure

```text
habit-chain/
├── contracts/
│   └── HabitChain.sol            # Smart contract with daily check-in logic
├── scripts/
│   └── deploy.cjs                # Deployment script targeting BOT Chain
├── test/
│   └── HabitChain.test.cjs       # Comprehensive unit test suite
├── src/
│   ├── components/               # Header, HabitCard, DashboardStats, WeeklyCalendar, Modals
│   ├── config/
│   │   └── wagmi.ts              # BOT Chain testnet definition & Reown AppKit configuration
│   ├── contracts/
│   │   ├── contractAbi.ts        # Typed contract ABI & defaults
│   │   └── contractConfig.json   # Auto-exported deployed address & ABI
│   ├── hooks/
│   │   └── useHabits.ts          # Custom hook for on-chain state & write functions
│   ├── utils/
│   │   └── streak.ts             # Client-side streak & 7-day calendar calculator
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # Main dashboard application
│   ├── main.tsx                  # React entry point with Wagmi & QueryClient providers
│   └── index.css                 # Tailwind directives
├── hardhat.config.cjs            # Hardhat network configuration (chainId: 968)
└── package.json
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js** v18+ or v20+ / v24
- **MetaMask** or any EVM compatible Web3 wallet

### 2. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 3. Smart Contract Compilation & Testing

Compile the Solidity contract:
```bash
npm run compile
```

Run the automated test suite:
```bash
npm run test
```
The test suite validates:
- Habit creation and name validation
- Daily check-in logic and duplicate check-in reversion
- Day transitions and multiple check-in history recording
- Pause (deactivate), resume (activate), and delete status modifications
- Access control ensuring only the owner can modify or check into their habits

---

## 🚀 Deploying to BOT Chain Testnet

1. Copy the environment template:
```bash
cp .env.example .env
```
2. In `.env`, add your deployer wallet private key:
```env
PRIVATE_KEY=your_private_key_here
BOT_RPC_URL=https://rpc.bohr.life
```
> ⚠️ **Security Warning**: Never share, commit, or expose your private key. Never store user private keys or seed phrases.

3. Execute the deployment script:
```bash
npm run deploy:bot
```
The script deploys `HabitChain.sol` to BOT Chain Testnet (Chain ID 968) and automatically writes the deployed contract address and ABI to `src/contracts/contractConfig.json`.

---

## 💻 Running the Frontend

Start the Vite development server:
```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### Connecting to BOT Chain in MetaMask:
If your wallet is not configured for BOT Chain, you can add it manually or click the network prompt in the app:
- **Network Name**: BOT Chain Testnet
- **New RPC URL**: `https://rpc.bohr.life`
- **Chain ID**: `968`
- **Currency Symbol**: `BOT`
- **Block Explorer URL**: `https://scan.bohr.life/`

---

## 🔒 Security & Privacy

- **No Private Key Custody**: The application communicates directly through user-approved wallet signatures via standard EVM providers (EIP-1193). It never requests, logs, or stores private keys or seed phrases.
- **Gas Efficiency**: Habits store only essential state (id, owner, name, status, created date, completion count, and history timestamps). Streaks and calendar views are rendered dynamically by the client.

