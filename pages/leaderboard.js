import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";

import { Header } from "@/components/points/Header";
import { Leaderboard as LeaderboardTable } from "@/components/points/Leaderboard";
import { StatCard } from "@/components/points/StatCard";

const PAGE_SIZE = 50;
const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "");

export default function LeaderboardPage() {
  const [wallet, setWallet] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  // your rank row
  const [myRow, setMyRow] = useState(null);

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

  async function loadLeaderboard(p = page) {
    setLoading(true);
    try {
      const offset = p * PAGE_SIZE;

      const res = await fetch(
        `/api/points/leaderboard?limit=${PAGE_SIZE}&offset=${offset}`
      );
      const json = await res.json();

      setRows(json?.rows || []);
      setTotal(json?.total || 0);
    } catch (e) {
      setRows([]);
      setTotal(0);
    }
    setLoading(false);
  }

  async function loadMyRank(w) {
    if (!w) return;
    try {
      const res = await fetch(`/api/points/rank?wallet=${w}`);
      const json = await res.json();
      setMyRow(json?.found ? json.row : null);
    } catch (e) {
      setMyRow(null);
    }
  }

  useEffect(() => {
    loadLeaderboard(0);
  }, []);

  useEffect(() => {
    loadLeaderboard(page);
  }, [page]);

  useEffect(() => {
    if (wallet) loadMyRank(wallet);
  }, [wallet]);

  const pageCount = useMemo(() => {
    return total ? Math.ceil(total / PAGE_SIZE) : 1;
  }, [total]);

  return (
    <div className="min-h-screen bg-background unibridge-bg relative">
      {/* gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent hidden dark:block" />
      </div>

      <Header isConnected={!!wallet} wallet={wallet} onConnect={connect} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* top actions */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <a
            href="/points"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </a>

          <button
            onClick={() => {
              loadLeaderboard(page);
              if (wallet) loadMyRank(wallet);
            }}
            className="unibridge-btn px-5 py-2.5 text-sm"
          >
            Refresh
          </button>
        </div>

        {/* ✅ Sticky Your Rank Card */}
        <div className="sticky top-[88px] z-20">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="unibridge-card unibridge-glow p-4 border border-border bg-card/70 backdrop-blur-md"
          >
            {!wallet ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Your Rank
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connect your wallet to view your rank.
                  </div>
                </div>

                <button onClick={connect} className="unibridge-btn px-4 py-2 text-sm">
                  Connect
                </button>
              </div>
            ) : !myRow ? (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Your Rank
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Not ranked yet. Earn points to appear on leaderboard.
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Wallet: {shortWallet(wallet)}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                  title="Your Rank"
                  value={`#${myRow.rank}`}
                  icon={Trophy}
                  variant="primary"
                />
                <StatCard
                  title="Final Score"
                  value={myRow.totalScore}
                  icon={Trophy}
                  variant="primary"
                />
                <StatCard
                  title="Unibridge / Staking"
                  value={`${myRow.unibridgePoints} / ${myRow.stakingPoints}`}
                  icon={BarChart3}
                  subtitle="Score split"
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* main leaderboard card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="unibridge-card unibridge-glow p-6"
        >
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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
              {loading ? "Loading..." : `${total} wallets`}
            </div>
          </div>

          {loading ? (
            <div className="text-muted-foreground">Fetching leaderboard...</div>
          ) : (
            <LeaderboardTable entries={rows} currentWallet={wallet} />
          )}

          {/* ✅ Pagination */}
          <div className="flex items-center justify-between mt-6 gap-3 flex-wrap">
            <div className="text-sm text-muted-foreground">
              Page {page + 1} of {pageCount}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(p - 1, 0))}
                className="px-3 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-2 rounded-lg bg-secondary border border-border hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
