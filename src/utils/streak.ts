import { DayStatus } from "../types";

/**
 * Calculates the current consecutive streak (in days) leading up to today (or yesterday).
 * A streak remains active if the user checked in today OR if they checked in yesterday
 * (giving them until the end of today to check in).
 */
export function calculateCurrentStreak(timestamps: (bigint | number)[]): number {
  if (!timestamps || timestamps.length === 0) return 0;

  // Convert all timestamps into UTC day indices (timestamp / 86400)
  const dayIndices = new Set<number>();
  for (const ts of timestamps) {
    const seconds = typeof ts === "bigint" ? Number(ts) : ts;
    const day = Math.floor(seconds / 86400);
    dayIndices.add(day);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const todayDay = Math.floor(nowSeconds / 86400);
  const yesterdayDay = todayDay - 1;

  // Determine starting point:
  let streak = 0;
  let currentCheckDay: number;

  if (dayIndices.has(todayDay)) {
    // Checked in today!
    streak = 1;
    currentCheckDay = yesterdayDay;
  } else if (dayIndices.has(yesterdayDay)) {
    // Has not checked in yet today, but checked in yesterday (streak is preserved)
    streak = 1;
    currentCheckDay = yesterdayDay - 1;
  } else {
    // Missed yesterday and today -> streak broken
    return 0;
  }

  // Count backwards day by day
  while (dayIndices.has(currentCheckDay)) {
    streak++;
    currentCheckDay--;
  }

  return streak;
}

/**
 * Generates the last 7 days data for a weekly calendar view.
 * Shows status (completed, missed, pending today).
 */
export function getWeeklyCalendarData(timestamps: (bigint | number)[]): DayStatus[] {
  const dayIndices = new Set<number>();
  if (timestamps) {
    for (const ts of timestamps) {
      const seconds = typeof ts === "bigint" ? Number(ts) : ts;
      dayIndices.add(Math.floor(seconds / 86400));
    }
  }

  const now = new Date();
  const todayUtcSeconds = Math.floor(Date.now() / 1000);
  const todayIndex = Math.floor(todayUtcSeconds / 86400);

  const days: DayStatus[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate last 7 days ending with today (from 6 days ago up to today)
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 86400 * 1000);
    const targetDayIndex = todayIndex - i;

    const isToday = i === 0;
    const isPast = i > 0;
    const isCompleted = dayIndices.has(targetDayIndex);

    days.push({
      date: targetDate,
      dayLabel: dayNames[targetDate.getUTCDay()],
      dateNumber: targetDate.getUTCDate(),
      formattedDate: targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      isToday,
      isCompleted,
      isPast,
      isFuture: false,
    });
  }

  return days;
}

/**
 * Formats a unix timestamp (in seconds) into a readable date string.
 */
export function formatTimestamp(timestamp: bigint | number): string {
  const seconds = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  if (!seconds) return "-";
  return new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

