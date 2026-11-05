import React from "react";
import { Habit } from "../types";
import { CheckCircle2, Flame, Award, ListTodo, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  habits: Habit[];
  isLoading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ habits, isLoading }) => {
  const activeHabits = habits.filter((h) => h.active && !h.deleted);
  const totalActive = activeHabits.length;

  const completedTodayCount = activeHabits.filter((h) => h.hasCheckedInToday).length;

  const progressPercent = totalActive > 0 ? Math.round((completedTodayCount / totalActive) * 100) : 0;

  const bestStreak = activeHabits.reduce((max, h) => {
    return Math.max(max, h.currentStreak || 0);
  }, 0);

  const totalCompletionsAllTime = habits.reduce((sum, h) => {
    return sum + Number(h.totalCompletions || 0n);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Completion Progress */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Today's Progress
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">
            {completedTodayCount}
          </span>
          <span className="text-sm font-medium text-slate-400">
            of {totalActive} habits
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1 text-slate-400">
            <span>Completion Rate</span>
            <span className="text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Active Habits */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Habits
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">{totalActive}</span>
          <span className="text-xs font-medium text-slate-400">
            ({habits.length - totalActive} paused)
          </span>
        </div>
        <p className="mt-4 text-xs text-slate-400 flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400 inline" />
          <span>Tracked permanently on BOT Chain</span>
        </p>
      </div>

      {/* 3. Highest Streak */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Best Active Streak
          </span>
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-orange-400">
            {bestStreak}
          </span>
          <span className="text-sm font-medium text-slate-400">consecutive days</span>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {bestStreak > 0
            ? "Keep the momentum going today!"
            : "Complete a habit today to start a streak!"}
        </p>
      </div>

      {/* 4. Total Completed Check-ins */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            All-Time Check-Ins
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">
            {totalCompletionsAllTime}
          </span>
          <span className="text-sm font-medium text-slate-400">verified blocks</span>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Total check-in transactions recorded
        </p>
      </div>
    </div>
  );
};

