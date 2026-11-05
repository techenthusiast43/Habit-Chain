export interface Habit {
  id: bigint;
  owner: string;
  name: string;
  active: boolean;
  deleted: boolean;
  createdAt: bigint;
  totalCompletions: bigint;
  hasCheckedInToday?: boolean;
  history?: bigint[];
  currentStreak?: number;
}

export interface DayStatus {
  date: Date;
  dayLabel: string;
  dateNumber: number;
  formattedDate: string;
  isToday: boolean;
  isCompleted: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface TxRecord {
  hash: string;
  habitId?: bigint;
  habitName?: string;
  type: 'create' | 'checkIn' | 'activate' | 'deactivate' | 'delete';
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

