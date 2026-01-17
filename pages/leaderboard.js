import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft } from "lucide-react";

import { Header } from "@/components/points/Header";
import { Leaderboard as LeaderboardTable } from "@/components/points/Leaderboard";

export default function LeaderboardPage() {
  const [wallet, setWallet] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

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

    // optional: register connect bonus
    await fetch("/api/points/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: w }),
    });
  }

  async function loadLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch("/api/points/leaderboard?limit=50");
      const json = await res.json();
      setRows(json?.rows || []);
    } catch (e) {
      setRows([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
   <div className="min-h-screen bg-background unibridge-bg relative">
  <div className="pointer-events-none fixed inset-0 -z-10">
    {/* Light gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:hidden" />
    {/* Dark gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent hidden dark:block" />
  </div>

      <Header isConnected={!!wallet} wallet={wallet} onConnect={connect} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/points"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>

         <button
  onClick={loadLeaderboard}
  className="unibridge-btn px-5 py-2.5 text-sm"
>
  Refresh
</button>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-7 h-7 text-primary" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Ranked by Final Score (Weighted)
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${rows.length} wallets`}
            </div>
          </div>

          {loading ? (
            <div className="text-muted-foreground">Fetching leaderboard...</div>
          ) : (
            <LeaderboardTable entries={rows} currentWallet={wallet} />
          )}
        </motion.div>
      </main>
    </div>
  );
}
