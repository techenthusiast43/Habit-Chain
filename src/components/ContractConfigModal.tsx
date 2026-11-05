import React, { useState } from "react";
import { Settings, X, Check, ExternalLink, HelpCircle } from "lucide-react";
import { botTestnet } from "../config/wagmi";

interface ContractConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSaveAddress: (address: `0x${string}`) => void;
}

export const ContractConfigModal: React.FC<ContractConfigModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onSaveAddress,
}) => {
  const [addressInput, setAddressInput] = useState(
    currentAddress === "0x0000000000000000000000000000000000000000" ? "" : currentAddress
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = addressInput.trim();
    if (!trimmed.startsWith("0x") || trimmed.length !== 42) {
      setError("Please enter a valid 42-character EVM address (e.g. 0x123...456)");
      return;
    }
    setError(null);
    onSaveAddress(trimmed as `0x${string}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Contract Settings</h2>
            <p className="text-xs text-slate-400">
              Configure your HabitChain smart contract on BOT Chain
            </p>
          </div>
        </div>

        {/* Network Details Box */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="font-semibold text-slate-300">Target Network:</span>
            <span className="text-emerald-400 font-mono">BOT Chain Testnet</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Chain ID:</span>
            <span className="font-mono text-slate-200">{botTestnet.id}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>RPC Endpoint:</span>
            <span className="font-mono text-slate-200">https://rpc.bohr.life</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Native Currency:</span>
            <span className="font-mono text-slate-200">BOT (18 decimals)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Block Explorer:</span>
            <a
              href="https://scan.bohr.life/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>scan.bohr.life</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              HabitChain Contract Address
            </label>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          <p className="text-[11px] text-slate-400 flex items-start space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>
              Deploy using <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">npm run deploy:bot</code>, then paste the deployed address above to interact with your contract.
            </span>
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

