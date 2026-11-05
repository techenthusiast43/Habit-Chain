import React, { useState } from "react";
import { Plus, X, Sparkles, Loader2 } from "lucide-react";

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<string>;
}

const PRESET_SUGGESTIONS = [
  "🏋️ Daily 30-min Workout",
  "📚 Read 20 Pages",
  "💧 Drink 2.5L Water",
  "💻 Code for 1 Hour",
  "🧘 10-min Meditation",
  "🚶 10,000 Steps",
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [habitName, setHabitName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = habitName.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a habit name");
      return;
    }
    if (trimmed.length > 120) {
      setErrorMessage("Habit name cannot exceed 120 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onCreate(trimmed);
      setHabitName("");
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.shortMessage || err?.message || "Failed to create habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Create New Habit</h2>
            <p className="text-xs text-slate-400">
              Your habit will be stored on the BOT Chain network.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Habit Name
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => {
                setHabitName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Read 20 pages of a book"
              maxLength={120}
              autoFocus
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
              <span>Must be a positive, daily measurable action</span>
              <span>{habitName.length}/120</span>
            </div>
          </div>

          {/* Quick Preset Ideas */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick inspiration:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUGGESTIONS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setHabitName(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !habitName.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating on-chain...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Habit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

