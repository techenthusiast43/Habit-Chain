import React, { useState } from "react";
import { Habit } from "../types";
import { formatTimestamp } from "../utils/streak";
import { WeeklyCalendar } from "./WeeklyCalendar";
import {
  Flame,
  Award,
  Check,
  Pause,
  Play,
  Trash2,
  Loader2,
  Calendar,
  MoreVertical,
  CheckCircle,
} from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  onCheckIn: (habitId: bigint, name: string) => Promise<string>;
  onActivate: (habitId: bigint, name: string) => Promise<string>;
  onDeactivate: (habitId: bigint, name: string) => Promise<string>;
  onDelete: (habitId: bigint, name: string) => Promise<string>;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onCheckIn,
  onActivate,
  onDeactivate,
  onDelete,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleCheckIn = async () => {
    if (habit.hasCheckedInToday || !habit.active || isPending) return;
    try {
      setIsPending(true);
      setActionType("checkin");
      await onCheckIn(habit.id, habit.name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
      setActionType(null);
    }
  };

  const handleToggleActive = async () => {
    try {
      setIsPending(true);
      if (habit.active) {
        setActionType("deactivate");
        await onDeactivate(habit.id, habit.name);
      } else {
        setActionType("activate");
        await onActivate(habit.id, habit.name);
      }
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
      return;
    }
    try {
      setIsPending(true);
      setActionType("delete");
      await onDelete(habit.id, habit.name);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPending(false);
      setActionType(null);
    }
  };

  const currentStreak = habit.currentStreak || 0;
  const totalCompletions = Number(habit.totalCompletions || 0n);

  return (
    <div
      className={`relative bg-slate-900/80 border rounded-2xl p-5 sm:p-6 transition-all duration-300 backdrop-blur-sm ${
        habit.hasCheckedInToday
          ? "border-emerald-500/40 shadow-lg shadow-emerald-950/40"
          : habit.active
          ? "border-slate-800 hover:border-slate-700 shadow-md"
          : "border-slate-800/40 opacity-70 bg-slate-950/60"
      }`}
    >
      {/* Header: Title, Status Badge & Actions Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white tracking-tight break-words">
              {habit.name}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                habit.active
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {habit.active ? "Active" : "Paused"}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Started {formatTimestamp(habit.createdAt)}</span>
          </div>
        </div>

        {/* Action Menu Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={isPending}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl py-1 text-xs">
              <button
                onClick={handleToggleActive}
                disabled={isPending}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center space-x-2 text-slate-200"
              >
                {habit.active ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause Habit</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume Habit</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="w-full text-left px-3.5 py-2 hover:bg-red-500/10 flex items-center space-x-2 text-red-400 border-t border-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Habit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Streak Pill */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              currentStreak > 0
                ? "bg-orange-500/15 text-orange-400"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white">
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Current Streak
            </div>
          </div>
        </div>

        {/* Total Completions Pill */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-white">
              {totalCompletions} {totalCompletions === 1 ? "day" : "days"}
            </div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Total Recorded
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <WeeklyCalendar history={habit.history} />

      {/* Primary Action Button (Daily Check In) */}
      <div className="mt-5">
        {habit.hasCheckedInToday ? (
          <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center space-x-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Checked In Today ✓</span>
          </div>
        ) : !habit.active ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-500 text-sm font-semibold cursor-not-allowed"
          >
            Habit is Paused
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={isPending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isPending && actionType === "checkin" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming on BOT Chain...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Daily Check In</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

