import React from "react";
import { getWeeklyCalendarData } from "../utils/streak";
import { Check, Minus, Clock } from "lucide-react";

interface WeeklyCalendarProps {
  history?: bigint[];
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ history = [] }) => {
  const days = getWeeklyCalendarData(history);

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Weekly Progress (Last 7 Days)
        </span>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Done</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" />
            <span>Missed</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          return (
            <div
              key={idx}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                day.isToday
                  ? "bg-slate-800/90 border border-emerald-500/30 ring-1 ring-emerald-500/20"
                  : "bg-slate-900/50 border border-slate-800/50"
              }`}
              title={`${day.formattedDate}: ${
                day.isCompleted
                  ? "Completed"
                  : day.isToday
                  ? "Pending check-in"
                  : "Missed"
              }`}
            >
              <span className="text-[10px] font-medium text-slate-400 uppercase">
                {day.dayLabel}
              </span>
              <span className="text-xs font-bold text-slate-300 mt-0.5">
                {day.dateNumber}
              </span>

              {/* Status Indicator */}
              <div className="mt-2">
                {day.isCompleted ? (
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : day.isToday ? (
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center animate-pulse">
                    <Clock className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-slate-800/40 border border-slate-700/30 text-slate-600 flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

