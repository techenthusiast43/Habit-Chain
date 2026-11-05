import React, { useState } from "react";
import { Header } from "./components/Header";
import { DashboardStats } from "./components/DashboardStats";
import { HabitCard } from "./components/HabitCard";
import { CreateHabitModal } from "./components/CreateHabitModal";
import { ContractConfigModal } from "./components/ContractConfigModal";
import { TransactionTracker } from "./components/TransactionTracker";
import { useHabits } from "./hooks/useHabits";
import { useAppKit } from "@reown/appkit/react";
import {
  Plus,
  RefreshCw,
  Sparkles,
  Shield,
  Zap,
  CalendarCheck,
  AlertCircle,
  ExternalLink,
  Layers,
} from "lucide-react";

export function App() {
  const { open } = useAppKit();
  const {
    contractAddress,
    setContractAddress,
    isContractConfigured,
    habits,
    isLoading,
    error,
    refreshHabits,
    createHabit,
    checkIn,
    deactivateHabit,
    activateHabit,
    deleteHabit,
    transactions,
    isConnected,
    userAddress,
  } = useHabits();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const filteredHabits = habits.filter((h) => {
    if (filter === "active") return h.active;
    if (filter === "paused") return !h.active;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        contractAddress={contractAddress}
        isContractConfigured={isContractConfigured}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner: If contract is not yet configured */}
        {!isContractConfigured && isConnected && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Smart Contract Address Required
                </h4>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Deploy HabitChain to BOT Chain Testnet or configure your contract address to track habits on-chain.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex-shrink-0"
            >
              Configure Address
            </button>
          </div>
        )}

        {/* Not Connected State (Hero) */}
        {!isConnected ? (
          <div className="py-12 sm:py-20 text-center max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live on BOT Chain Testnet (Chain ID 968)</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Build Unbreakable Habits,{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Proven On-Chain.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              HabitChain is a decentralized daily habit tracker. Commit to your goals,
              record verifiable daily check-ins on the blockchain, and grow verifiable streaks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => open()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Connect Wallet to Begin
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all"
              >
                View Network Details
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-12 text-left">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Owner Controlled</h3>
                <p className="text-xs text-slate-400">
                  Each habit belongs exclusively to your wallet. You own and control your data.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">One Check-In / Day</h3>
                <p className="text-xs text-slate-400">
                  Smart contract enforces strictly 1 check-in per UTC day using block timestamps.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Streaks & Calendars</h3>
                <p className="text-xs text-slate-400">
                  Real-time streak calculation with 7-day weekly calendar visualizers.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Connected Dashboard */
          <div className="space-y-8 animate-fade-in">
            {/* Top Stats Overview */}
            <DashboardStats habits={habits} isLoading={isLoading} />

            {/* Habits Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                  <span>My Daily Habits</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {habits.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Keep your chain going by checking in before the UTC day ends.
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {/* Filter Tabs */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filter === "all"
                        ? "bg-emerald-500 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("active")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filter === "active"
                        ? "bg-emerald-500 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter("paused")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      filter === "paused"
                        ? "bg-emerald-500 text-white font-bold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Paused
                  </button>
                </div>

                {/* Refresh */}
                <button
                  onClick={refreshHabits}
                  disabled={isLoading}
                  title="Refresh habits from blockchain"
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
                </button>

                {/* Create Habit Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Habit</span>
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
                <span>{error}</span>
                <button onClick={refreshHabits} className="underline font-bold">
                  Retry
                </button>
              </div>
            )}

            {/* Habits Grid */}
            {isLoading && habits.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm text-slate-400">Loading your habits from BOT Chain...</p>
              </div>
            ) : filteredHabits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHabits.map((habit) => (
                  <HabitCard
                    key={habit.id.toString()}
                    habit={habit}
                    onCheckIn={checkIn}
                    onActivate={activateHabit}
                    onDeactivate={deactivateHabit}
                    onDelete={deleteHabit}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No habits found</h3>
                <p className="text-xs text-slate-400">
                  {filter !== "all"
                    ? `You don't have any ${filter} habits.`
                    : "Create your first daily habit to start logging verified blockchain check-ins!"}
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create First Habit</span>
                </button>
              </div>
            )}

            {/* Transaction Tracker / History Drawer */}
            <TransactionTracker transactions={transactions} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">HabitChain</span>
            <span>•</span>
            <span>BOT Chain Testnet (ID: 968)</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://scan.bohr.life/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 flex items-center space-x-1 transition-colors"
            >
              <span>BOHR Scan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://rpc.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 flex items-center space-x-1 transition-colors"
            >
              <span>RPC Status</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createHabit}
      />

      <ContractConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAddress={contractAddress}
        onSaveAddress={setContractAddress}
      />
    </div>
  );
}
export default App;

