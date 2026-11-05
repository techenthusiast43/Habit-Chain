import React, { useState } from "react";
import { TxRecord } from "../types";
import {
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";

interface TransactionTrackerProps {
  transactions: TxRecord[];
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ transactions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (transactions.length === 0) return null;

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getActionLabel = (tx: TxRecord) => {
    switch (tx.type) {
      case "checkIn":
        return `Daily Check-in ${tx.habitName ? `(${tx.habitName})` : ""}`;
      case "create":
        return `Created Habit ${tx.habitName ? `"${tx.habitName}"` : ""}`;
      case "activate":
        return `Resumed Habit ${tx.habitName ? `"${tx.habitName}"` : ""}`;
      case "deactivate":
        return `Paused Habit ${tx.habitName ? `"${tx.habitName}"` : ""}`;
      case "delete":
        return `Deleted Habit ${tx.habitName ? `"${tx.habitName}"` : ""}`;
      default:
        return "Transaction";
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const latestPending = transactions.filter((t) => t.status === "pending");

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Recent Transactions</span>
              {latestPending.length > 0 && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{latestPending.length} pending</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Verified on BOHR Scan ({transactions.length} recorded)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <span>{isExpanded ? "Hide" : "View"}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Transaction List */}
      {isExpanded && (
        <div className="border-t border-slate-800 divide-y divide-slate-850 max-h-72 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="px-5 py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-850/50 transition-colors"
            >
              {/* Status & Label */}
              <div className="flex items-center space-x-3 min-w-0">
                {tx.status === "pending" ? (
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                ) : tx.status === "success" ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="font-semibold text-slate-200 truncate">
                    {getActionLabel(tx)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Hash & Explorer Link */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                  {truncateHash(tx.hash)}
                </span>
                <button
                  onClick={() => copyToClipboard(tx.hash)}
                  className="p-1 hover:text-white text-slate-500 rounded"
                  title="Copy full hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://scan.bohr.life/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 hover:text-emerald-400 text-slate-500 rounded"
                  title="View on BOHR Scan"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

