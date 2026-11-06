# ⛓️ HabitChain Whitepaper
**A Decentralized Protocol for Daily Habit Tracking & Verifiable Proof-of-Consistency on the BOT Chain Network**

* **Document Version**: 1.0.0  
* **Date**: November 2026  
* **Target Network**: BOT Chain Testnet (Chain ID: `968`)  
* **Contract Address**: [`0x18C0ac26730303A135e632F077d451bb740dbEA9`](https://scan.bohr.life/address/0x18C0ac26730303A135e632F077d451bb740dbEA9)  
* **Repository**: [https://github.com/techenthusiast43/Habit-Chain](https://github.com/techenthusiast43/Habit-Chain)  

---

## Executive Summary

**HabitChain** is a lightweight, non-custodial decentralized application (dApp) designed to turn daily human discipline into immutable, cryptographically verifiable records on the blockchain. 

Unlike conventional Web2 habit trackers—which suffer from siloed databases, manipulative monetisation models, lack of true data ownership, and easily fabricated progress—HabitChain leverages the **BOT Chain** to record daily check-ins permanently in smart contract state. By enforcing strictly one check-in per UTC day through blockchain timestamps, HabitChain establishes an objective, tamper-proof **Proof-of-Consistency** mechanism.

---

## 1. Problem Statement & Motivation

### 1.1 The Vulnerability of Web2 Habit Tracking
Traditional habit tracking applications (e.g., Habitica, Streaks, Way of Life) rely on centralized cloud databases. This architecture introduces distinct limitations:
1. **Lack of Verifiability**: Centralized records can be manually edited, retroactively filled, or wiped at any time. There is no proof of real-time adherence.
2. **Platform Lock-in & Data Silos**: If a user cancels a subscription or the service shuts down, the user's historical discipline records disappear.
3. **Feature Bloat & Extractive Monetization**: Most apps gate basic analytics behind subscription paywalls or introduce complex game mechanics that distract from core habit development.

### 1.2 The Web3 Opportunity: Proof-of-Consistency
Blockchain technology is inherently suited for logging verifiable temporal states. By recording habit check-ins as on-chain transactions:
* **Timestamps are mathematically anchored** to block production times.
* **Records are sovereign** and tied to the user's EVM wallet address.
* **Accountability is public and auditable** via standard block explorers (e.g., BOHR Scan).

---

## 2. Core Protocol Principles

HabitChain operates under five architectural principles:

1. **Pure Utility & Zero Token Clutter**: No speculative ERC-20 tokens, no yield farming, and no artificial staking locks. HabitChain exists strictly as a functional on-chain utility.
2. **Strict Daily Cadence**: The smart contract mathematically enforces that an active habit can only be checked into once per UTC calendar day ($86,400\text{ seconds}$).
3. **Self-Sovereign Ownership**: Each habit belongs exclusively to the creating wallet address. Only the verified `msg.sender` can check in, pause, resume, or delete their habit.
4. **Gas Efficiency via Client-Side Offloading**: Streaks and rolling calendars are calculated dynamically on the frontend rather than stored as bloated on-chain state, minimizing storage gas fees for users.
5. **Universal EVM Compatibility**: Compatible with MetaMask, Rabby, Coinbase Wallet, Brave Wallet, and mobile wallet browsers via Reown AppKit and Wagmi v2.

---

## 3. System Architecture & Smart Contract Design

### 3.1 Network Topology: BOT Chain
HabitChain is deployed on the **BOT Chain Testnet**:
- **Chain ID**: `968`
- **RPC Endpoint**: `https://rpc.bohr.life`
- **Native Currency**: `BOT` (18 Decimals)
- **Total Supply**: 150,000,000 BOT
- **Block Explorer**: `https://scan.bohr.life/`

### 3.2 Smart Contract Architecture (`HabitChain.sol`)
The core contract is written in Solidity `^0.8.20` and optimized with 200 runs via Hardhat.

```solidity
struct Habit {
    uint256 id;
    address owner;
    string name;
    bool active;
    bool deleted;
    uint256 createdAt;
    uint256 totalCompletions;
}
```

#### Core Data Mappings:
* `habits`: `mapping(uint256 => Habit)` — Primary habit registry.
* `hasCheckedInDay`: `mapping(uint256 => mapping(uint256 => bool))` — Records boolean completion indexed by habit ID and UTC day index.
* `_checkInHistory`: `mapping(uint256 => uint256[])` — Array of block timestamps for every check-in event.
* `_userHabits`: `mapping(address => uint256[])` — Reverse lookup linking wallet addresses to their owned habit IDs.

### 3.3 The Daily Check-in Mechanism
To ensure consistency across time zones, the protocol standardizes daily intervals on Universal Coordinated Time (UTC) using integer division:

$$\text{Day Index} = \left\lfloor \frac{\text{block.timestamp}}{86400} \right\rfloor$$

When a user calls `checkIn(uint256 habitId)`:
1. **Authorization Check**: Asserts `habits[habitId].owner == msg.sender` and `!habits[habitId].deleted`.
2. **Active Status Check**: Asserts `habits[habitId].active == true`.
3. **Duplicate Prevention**: Computes $\text{currentDay} = \text{block.timestamp} / 86400$. Asserts `!hasCheckedInDay[habitId][currentDay]`.
4. **State Transition**:
   * Sets `hasCheckedInDay[habitId][currentDay] = true`.
   * Pushes `block.timestamp` to `_checkInHistory[habitId]`.
   * Increments `totalCompletions` by 1.
5. **Event Emission**: Emits `HabitCheckedIn(habitId, msg.sender, block.timestamp, totalCompletions)`.

---

## 4. Gas Optimization Model

In traditional on-chain game/habit contracts, updating streaks requires reading, updating, and writing complex historical streak variables on every transaction, resulting in escalating storage costs.

HabitChain eliminates this overhead:
* **$O(1)$ Daily Verification**: Daily duplicate checks require a single `SSTORE` operation (`hasCheckedInDay[id][day] = true`).
* **Timestamp Append Only**: Historical check-ins are logged as sequential timestamps in an append-only array.
* **Off-Chain Streak Calculation**: The client dynamically traverses timestamps backwards from today/yesterday to compute current and best streaks in milliseconds without consuming gas.

### Streak Calculation Algorithm (Client-Side)
```typescript
let streak = 0;
if (dayIndices.has(today)) {
    streak = 1;
    currentDay = today - 1;
} else if (dayIndices.has(yesterday)) {
    streak = 1;
    currentDay = yesterday - 1;
} else {
    return 0; // Streak broken
}

while (dayIndices.has(currentDay)) {
    streak++;
    currentDay--;
}
return streak;
```

---

## 5. Security & Verification

### 5.1 Access Control & Modifiers
All state-modifying functions enforce the `onlyHabitOwner` modifier:
* Users cannot check into habits owned by other wallets.
* Users cannot deactivate, reactivate, or delete habits belonging to other addresses.
* Soft-deleted habits cannot receive further check-in transactions.

### 5.2 Test Coverage
The smart contract underwent comprehensive testing via Hardhat and Chai:
* **Creation Validation**: Reversion of empty strings ($0 < \text{len} \le 120$).
* **User Isolation**: Isolation of habits across distinct wallet addresses.
* **Duplicate Protection**: Verified rejection of multiple check-ins within the same 86,400-second window.
* **Day Rollover**: Verified that `time.increase(86401)` resets daily check-in eligibility.
* **Access Control**: Reversion of unauthorized callers attempting state modifications.

---

## 6. Frontend & User Experience

The frontend is constructed using a modern, reactive Web3 stack:
* **Framework**: React 18 + TypeScript + Vite.
* **Styling**: Tailwind CSS (dark mode obsidian tech theme with emerald accents).
* **Web3 Integration**: `@reown/appkit`, `@reown/appkit-adapter-wagmi`, `wagmi@2.x`, and `viem`.
* **State Management**: `@tanstack/react-query`.
* **7-Day Rolling Calendar**: Visual status pills illustrating completed days, missed days, and active daily check-in states.
* **Transaction Tracker**: Real-time transaction notification system with direct links to BOHR Scan.

---

## 7. Roadmap

### Phase 1: Testnet Deployment & Verification (Current)
- [x] Solidity smart contract architecture (`HabitChain.sol`)
- [x] Automated test suite (11/11 passing tests)
- [x] BOT Chain Testnet deployment (`0x18C0ac26730303A135e632F077d451bb740dbEA9`)
- [x] Responsive dApp dashboard with Reown AppKit & Wagmi v2
- [x] Vercel production build & deployment pipeline

### Phase 2: Community & Ecosystem Expansion
- [ ] BOT Chain Ecosystem Directory listing
- [ ] Community 7-Day Habit Streak Challenge campaign
- [ ] Gas sponsorship / Account Abstraction (ERC-4337) evaluation

### Phase 3: Accountability & Social Proof
- [ ] Optional public habit profiles (shareable streak certificates)
- [ ] Habit Squads / Accountability groups with multi-signature verification
- [ ] Soulbound / Non-transferable Consistency Badges (SBTs) for 30/60/100-day streaks

### Phase 4: Mainnet Launch
- [ ] Final security audit
- [ ] BOT Chain Mainnet deployment

---

## 8. Conclusion

HabitChain demonstrates how blockchain infrastructure can be applied to personal productivity without financial speculation or artificial complexity. By combining immutable smart contract logic on the BOT Chain network with gas-optimized client-side rendering, HabitChain provides users with an uncheatable, self-sovereign record of their daily discipline.

---

*© 2026 HabitChain Protocol. Published under the MIT License.*
