import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Coins, Lock, BarChart3 } from "lucide-react";

import { Header } from "@/components/points/Header";
import { StatCard } from "@/components/points/StatCard";

const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "");

export default function Points() {
  const [wallet, setWallet] = useState("");
  const [data, setData] = useState(null);

  async function refresh(w) {
    if (!w) return;
    const res = await fetch(`/api/points/summary?wallet=${w}`);
    const json = await res.json();
    setData(json);
  }

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const w = accounts?.[0];
    if (!w) return;

    setWallet(w);

    // register connect bonus (server-side)
    await fetch("/api/points/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: w }),
    });

    await refresh(w);
  }

  useEffect(() => {
    if (wallet) refresh(wallet);
  }, [wallet]);

  const isConnected = !!wallet;

  return (
   <div className="min-h-screen bg-background unibridge-bg relative">
  <div className="pointer-events-none fixed inset-0 -z-10">
    {/* Light gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:hidden" />
    {/* Dark gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent hidden dark:block" />
  </div>

      <Header isConnected={isConnected} wallet={wallet} onConnect={connect} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-3">
                Unibridge Points Dashboard
              </h1>

              <p className="text-muted-foreground mb-6">
                Connect your wallet to see your real-time points.
              </p>

              <button
                onClick={connect}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                Connect MetaMask
              </button>

              <div className="mt-8 flex justify-center">
                <a
                  href="/leaderboard"
                  className="px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
                >
                  View Leaderboard
                </a>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="unibridge-card unibridge-glow p-8 space-y-6"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Your Points</h2>
                  <p className="text-muted-foreground">
                    Wallet: {shortWallet(wallet)}
                  </p>
                </div>

               <button
  onClick={() => refresh(wallet)}
  className="unibridge-btn px-4 py-2 text-sm"
>
  Refresh
</button>

              </div>

              {/* ✅ Aligned Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Unibridge Earned"
                  value={data?.unibridgePoints ?? 0}
                  icon={Coins}
                />

                <StatCard
                  title="Staking Earned"
                  value={data?.stakingPoints ?? 0}
                  icon={Lock}
                  variant="accent"
                />

                <StatCard
                  title="Total Earned"
                  value={(data?.unibridgePoints ?? 0) + (data?.stakingPoints ?? 0)}
                  icon={Trophy}
                  variant="primary"
                />

                <StatCard
                  title="Final Score"
                  value={data?.totalScore ?? 0}
                  icon={Trophy}
                  subtitle={data?.rank ? `Rank #${data.rank}` : "—"}
                  variant="primary"
                />

                <StatCard
                  title="Weight Split"
                  value="60 / 40"
                  icon={BarChart3}
                  subtitle="Unibridge / Staking"
                />

                <StatCard
                  title="Wallet"
                  value={shortWallet(wallet)}
                  icon={BarChart3}
                  subtitle="Connected"
                />
              </div>

              {/* Leaderboard button */}
              <div className="flex justify-start">
                <a
                  href="/leaderboard"
                  className="px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
                >
                  View Leaderboard
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
