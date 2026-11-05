import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { Activity, Flame, Settings, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { botTestnet } from "../config/wagmi";

interface HeaderProps {
  contractAddress: string;
  isContractConfigured: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  contractAddress,
  isContractConfigured,
  onOpenSettings,
}) => {
  const { address, isConnected, chainId } = useAccount();
  const { open } = useAppKit();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== botTestnet.id;

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <span className="text-xl">⛓️</span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Habit<span className="text-emerald-400">Chain</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                BOT Chain
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Verifiable daily habits recorded on-chain
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Wrong Network Warning */}
          {isWrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: botTestnet.id })}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch to BOT Chain</span>
            </button>
          )}

          {/* Contract Config Button */}
          <button
            onClick={onOpenSettings}
            title={isContractConfigured ? `Contract: ${contractAddress}` : "Configure Contract Address"}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isContractConfigured
                ? "bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isContractConfigured ? truncateAddress(contractAddress) : "Set Contract"}
            </span>
          </button>

          {/* Network Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-slate-200">BOT Testnet (968)</span>
          </div>

          {/* Wallet Connect Button */}
          {isConnected && address ? (
            <button
              onClick={() => open()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-sm font-semibold text-white shadow-sm transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{truncateAddress(address)}</span>
            </button>
          ) : (
            <button
              onClick={() => open()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

