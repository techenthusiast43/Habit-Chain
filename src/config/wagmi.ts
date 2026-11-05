import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "viem";
import { http } from "wagmi";

// 1. Define BOT Chain Testnet as a custom EVM chain
export const botTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.bohr.life"],
    },
  },
  blockExplorers: {
    default: { name: "BOHR Scan", url: "https://scan.bohr.life" },
  },
  testnet: true,
});

// 2. Reown AppKit Project ID (from cloud.reown.com or env)
// A fallback ID is provided for local/testnet development
export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID || "b22b6291a0c79e6f966ce1e988b4ebbe";

// 3. Create Wagmi Adapter
export const networks = [botTestnet] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [botTestnet],
  transports: {
    [botTestnet.id]: http("https://rpc.bohr.life"),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

// 4. Initialize Reown AppKit Modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botTestnet],
  defaultNetwork: botTestnet,
  projectId,
  metadata: {
    name: "HabitChain",
    description: "Blockchain-based daily habit tracker on the BOT Chain network",
    url: typeof window !== "undefined" ? window.location.origin : "https://habitchain.local",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#10b981",
    "--w3m-border-radius-master": "12px",
  },
});

