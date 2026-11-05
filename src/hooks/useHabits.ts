import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { HABIT_CHAIN_ABI } from "../contracts/contractAbi";
import deployedConfig from "../contracts/contractConfig.json";
import { Habit, TxRecord } from "../types";
import { calculateCurrentStreak } from "../utils/streak";

const STORAGE_KEY_CONTRACT = "habitchain_contract_address";
const STORAGE_KEY_TXS = "habitchain_tx_records";

export function useHabits() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Dynamic contract address: priority = localStorage -> .env -> deployedConfig.json
  const [contractAddress, setContractAddressState] = useState<`0x${string}`>(() => {
    const cached = localStorage.getItem(STORAGE_KEY_CONTRACT);
    if (cached && cached.startsWith("0x") && cached.length === 42) {
      return cached as `0x${string}`;
    }
    const envAddr = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (envAddr && envAddr.startsWith("0x") && envAddr.length === 42) {
      return envAddr as `0x${string}`;
    }
    if (deployedConfig.address && deployedConfig.address !== "0x0000000000000000000000000000000000000000") {
      return deployedConfig.address as `0x${string}`;
    }
    return "0x0000000000000000000000000000000000000000" as `0x${string}`;
  });

  const setContractAddress = (addr: `0x${string}`) => {
    setContractAddressState(addr);
    localStorage.setItem(STORAGE_KEY_CONTRACT, addr);
  };

  const isContractConfigured = useMemo(() => {
    return (
      contractAddress !== "0x0000000000000000000000000000000000000000" &&
      contractAddress.length === 42
    );
  }, [contractAddress]);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transactions list
  const [transactions, setTransactions] = useState<TxRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TXS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addTxRecord = useCallback((record: TxRecord) => {
    setTransactions((prev) => {
      const updated = [record, ...prev].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save tx record to localStorage", e);
      }
      return updated;
    });
  }, []);

  const updateTxStatus = useCallback((hash: string, status: "success" | "error", errorMessage?: string) => {
    setTransactions((prev) => {
      const updated = prev.map((tx) =>
        tx.hash.toLowerCase() === hash.toLowerCase()
          ? { ...tx, status, errorMessage }
          : tx
      );
      try {
        localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update tx record in localStorage", e);
      }
      return updated;
    });
  }, []);

  // Fetch all user habits and their check-in details
  const fetchHabits = useCallback(async () => {
    if (!publicClient || !address || !isContractConfigured) {
      setHabits([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch habits list from contract
      const rawHabits = (await publicClient.readContract({
        address: contractAddress,
        abi: HABIT_CHAIN_ABI,
        functionName: "getMyHabits",
        account: address,
      })) as Array<{
        id: bigint;
        owner: string;
        name: string;
        active: boolean;
        deleted: boolean;
        createdAt: bigint;
        totalCompletions: bigint;
      }>;

      // 2. Fetch history and today's status for each habit in parallel
      const enrichedHabits: Habit[] = await Promise.all(
        rawHabits.map(async (h) => {
          try {
            const [hasCheckedIn, history] = await Promise.all([
              publicClient.readContract({
                address: contractAddress,
                abi: HABIT_CHAIN_ABI,
                functionName: "hasCheckedInToday",
                args: [h.id],
              }) as Promise<boolean>,
              publicClient.readContract({
                address: contractAddress,
                abi: HABIT_CHAIN_ABI,
                functionName: "getCheckInHistory",
                args: [h.id],
                account: address,
              }) as Promise<bigint[]>,
            ]);

            const currentStreak = calculateCurrentStreak(history);

            return {
              ...h,
              hasCheckedInToday: hasCheckedIn,
              history: history,
              currentStreak,
            };
          } catch (e) {
            console.error(`Error enriching habit #${h.id}:`, e);
            return {
              ...h,
              hasCheckedInToday: false,
              history: [],
              currentStreak: 0,
            };
          }
        })
      );

      setHabits(enrichedHabits);
    } catch (err: any) {
      console.error("Failed to load habits:", err);
      setError(err?.shortMessage || err?.message || "Failed to load habits from blockchain");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address, contractAddress, isContractConfigured]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Actions
  const createHabit = async (name: string): Promise<string> => {
    if (!walletClient || !address) throw new Error("Wallet not connected");
    if (!isContractConfigured) throw new Error("Contract address is not configured");

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: HABIT_CHAIN_ABI,
      functionName: "createHabit",
      args: [name.trim()],
      account: address,
    });

    addTxRecord({
      hash,
      type: "create",
      habitName: name.trim(),
      timestamp: Date.now(),
      status: "pending",
    });

    // Wait for confirmation
    if (publicClient) {
      publicClient
        .waitForTransactionReceipt({ hash })
        .then(() => {
          updateTxStatus(hash, "success");
          fetchHabits();
        })
        .catch((err) => {
          updateTxStatus(hash, "error", err?.shortMessage || err?.message);
        });
    }

    return hash;
  };

  const checkIn = async (habitId: bigint, habitName?: string): Promise<string> => {
    if (!walletClient || !address) throw new Error("Wallet not connected");
    if (!isContractConfigured) throw new Error("Contract address is not configured");

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: HABIT_CHAIN_ABI,
      functionName: "checkIn",
      args: [habitId],
      account: address,
    });

    addTxRecord({
      hash,
      type: "checkIn",
      habitId,
      habitName,
      timestamp: Date.now(),
      status: "pending",
    });

    if (publicClient) {
      publicClient
        .waitForTransactionReceipt({ hash })
        .then(() => {
          updateTxStatus(hash, "success");
          fetchHabits();
        })
        .catch((err) => {
          updateTxStatus(hash, "error", err?.shortMessage || err?.message);
        });
    }

    return hash;
  };

  const deactivateHabit = async (habitId: bigint, habitName?: string): Promise<string> => {
    if (!walletClient || !address) throw new Error("Wallet not connected");
    if (!isContractConfigured) throw new Error("Contract address is not configured");

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: HABIT_CHAIN_ABI,
      functionName: "deactivateHabit",
      args: [habitId],
      account: address,
    });

    addTxRecord({
      hash,
      type: "deactivate",
      habitId,
      habitName,
      timestamp: Date.now(),
      status: "pending",
    });

    if (publicClient) {
      publicClient
        .waitForTransactionReceipt({ hash })
        .then(() => {
          updateTxStatus(hash, "success");
          fetchHabits();
        })
        .catch((err) => {
          updateTxStatus(hash, "error", err?.shortMessage || err?.message);
        });
    }

    return hash;
  };

  const activateHabit = async (habitId: bigint, habitName?: string): Promise<string> => {
    if (!walletClient || !address) throw new Error("Wallet not connected");
    if (!isContractConfigured) throw new Error("Contract address is not configured");

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: HABIT_CHAIN_ABI,
      functionName: "activateHabit",
      args: [habitId],
      account: address,
    });

    addTxRecord({
      hash,
      type: "activate",
      habitId,
      habitName,
      timestamp: Date.now(),
      status: "pending",
    });

    if (publicClient) {
      publicClient
        .waitForTransactionReceipt({ hash })
        .then(() => {
          updateTxStatus(hash, "success");
          fetchHabits();
        })
        .catch((err) => {
          updateTxStatus(hash, "error", err?.shortMessage || err?.message);
        });
    }

    return hash;
  };

  const deleteHabit = async (habitId: bigint, habitName?: string): Promise<string> => {
    if (!walletClient || !address) throw new Error("Wallet not connected");
    if (!isContractConfigured) throw new Error("Contract address is not configured");

    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi: HABIT_CHAIN_ABI,
      functionName: "deleteHabit",
      args: [habitId],
      account: address,
    });

    addTxRecord({
      hash,
      type: "delete",
      habitId,
      habitName,
      timestamp: Date.now(),
      status: "pending",
    });

    if (publicClient) {
      publicClient
        .waitForTransactionReceipt({ hash })
        .then(() => {
          updateTxStatus(hash, "success");
          fetchHabits();
        })
        .catch((err) => {
          updateTxStatus(hash, "error", err?.shortMessage || err?.message);
        });
    }

    return hash;
  };

  return {
    contractAddress,
    setContractAddress,
    isContractConfigured,
    habits,
    isLoading,
    error,
    refreshHabits: fetchHabits,
    createHabit,
    checkIn,
    deactivateHabit,
    activateHabit,
    deleteHabit,
    transactions,
    isConnected,
    userAddress: address,
    chainId,
  };
}

