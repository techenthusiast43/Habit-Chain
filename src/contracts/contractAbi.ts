export const HABIT_CHAIN_ABI = [
  {
    type: "function",
    name: "createHabit",
    inputs: [{ name: "name", type: "string", internalType: "string" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deactivateHabit",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "activateHabit",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deleteHabit",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMyHabits",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct HabitChain.Habit[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "owner", type: "address", internalType: "address" },
          { name: "name", type: "string", internalType: "string" },
          { name: "active", type: "bool", internalType: "bool" },
          { name: "deleted", type: "bool", internalType: "bool" },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
          { name: "totalCompletions", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasCheckedInToday",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCheckInHistory",
    inputs: [{ name: "habitId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "HabitCreated",
    inputs: [
      { name: "habitId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "name", type: "string", indexed: false, internalType: "string" },
      { name: "createdAt", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HabitCheckedIn",
    inputs: [
      { name: "habitId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "totalCompletions", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HabitDeactivated",
    inputs: [
      { name: "habitId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HabitActivated",
    inputs: [
      { name: "habitId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HabitDeleted",
    inputs: [
      { name: "habitId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "owner", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
] as const;

// Default address can be overridden by VITE_CONTRACT_ADDRESS or contractConfig.json
export const DEFAULT_CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

