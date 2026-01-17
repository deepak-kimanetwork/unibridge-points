import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Coins, Lock, BarChart3, ArrowRight } from "lucide-react";

import { Header } from "@/components/points/Header";
import { StatCard } from "@/components/points/StatCard";
import { TabsNav } from "@/components/points/TabsNav";

const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "");

export default function Points() {
  const [wallet, setWallet] = useState("");
  const [data, setData] = useState(null);

  // ✅ Dashboard tab state
  const [tab, setTab] = useState("overview");

  // ✅ Referral wallet (from ?ref=)
  const [refCode, setRefCode] = useState("");

  async function refresh(w) {
    if (!w) return;
    const res = await fetch(`/api/points/summary?wallet=${w}`);
    const json = await res.json();
    setData(json);
  }

  // ✅ Capture referral from URL + store in localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setRefCode(ref);
      localStorage.setItem("unibridge_ref", ref);
    } else {
      const saved = localStorage.getItem("unibridge_ref");
      if (saved) setRefCode(saved);
    }
  }, []);

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

  // ✅ read ref from URL like: /points?ref=0xReferrerWallet
  const urlParams = new URLSearchParams(window.location.search);
  const referrerWallet = urlParams.get("ref");

  // ✅ connect bonus + referral tracking (server-side)
  await fetch("/api/points/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet: w, referrerWallet }),
  });

  await refresh(w);
}



  useEffect(() => {
    if (wallet) refresh(wallet);
  }, [wallet]);

  const isConnected = !!wallet;

  return (
    <div className="min-h-screen bg-background unibridge-bg relative">
      {/* background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent hidden dark:block" />
      </div>

      <Header isConnected={isConnected} wallet={wallet} onConnect={connect} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            // ✅ BEFORE CONNECT (UniBridge style hero)
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-card/60 border border-border flex items-center justify-center shadow-sm">
                <Trophy className="w-8 h-8 text-primary" />
              </div>

              <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-primary">Earn Points.</span>
                <br />
                <span>Get Rewarded.</span>
              </h1>

              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Connect your wallet to start earning points for UniBridge activity and KIMA staking.
                Climb the leaderboard and prepare for the upcoming airdrop.
              </p>

              {/* small chips */}
              <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                <a
                  href="https://unibridge.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-card/40 border border-border hover:bg-card/70 text-sm"
                >
                  Swap, Bridge, Onramp
                </a>

                <a
                  href="https://lp.kima.network"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-full bg-card/40 border border-border hover:bg-card/70 text-sm"
                >
                  Stake $KIMA
                </a>

                <span className="px-4 py-2 rounded-full bg-card/40 border border-border text-sm">
                  Earn Airdrop
                </span>
              </div>

              {/* ✅ Optional: show referral preview */}
              {refCode && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Referral detected:{" "}
                  <span className="font-mono text-foreground">{shortWallet(refCode)}</span>
                </div>
              )}

              <div className="mt-8 flex justify-center gap-3 flex-wrap">
                <button
                  onClick={connect}
                  className="unibridge-btn px-7 py-3 text-base font-semibold inline-flex items-center gap-2"
                >
                  Connect MetaMask <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="/leaderboard"
                  className="px-6 py-3 rounded-xl bg-secondary border border-border hover:bg-secondary/80"
                >
                  View Leaderboard
                </a>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                Click “Connect Wallet” above to get started.
              </p>
            </motion.div>
          ) : (
            // ✅ AFTER CONNECT (Tabbed dashboard)
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="unibridge-card unibridge-glow p-8 space-y-6"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-semibold">Dashboard</h2>
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

              {/* ✅ Cards */}
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

              {/* ✅ Tabs */}
              <TabsNav value={tab} onChange={setTab} />

              {/* ✅ Tab content */}
              {tab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-card/40 border border-border">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      UniBridge transaction history will appear here once explorer parsing is fully enabled.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-card/40 border border-border">
                    <h3 className="text-lg font-semibold">Active Stakes</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your staking stats are indexed daily from the staking contract.
                    </p>
                  </div>
                </div>
              )}

              {tab === "transactions" && (
                <div className="p-6 rounded-2xl bg-card/40 border border-border">
                  <h3 className="text-lg font-semibold">Transactions</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Coming next: UniBridge widget tx verification + USD points calculation.
                  </p>
                </div>
              )}

              {tab === "staking" && (
                <div className="p-6 rounded-2xl bg-card/40 border border-border">
                  <h3 className="text-lg font-semibold">Staking</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Coming next: pool breakdown + lock duration impact + daily rewards timeline.
                  </p>
                </div>
              )}

              {tab === "leaderboard" && (
                <div className="p-6 rounded-2xl bg-card/40 border border-border flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-lg font-semibold">Leaderboard</h3>
                    <p className="text-sm text-muted-foreground">
                      View global ranking by Final Score (weighted)
                    </p>
                  </div>

                  <a href="/leaderboard" className="unibridge-btn px-4 py-2 text-sm">
                    Open Leaderboard
                  </a>
                </div>
              )}

              {tab === "rules" && (
                <div className="p-6 rounded-2xl bg-card/40 border border-border">
                  <h3 className="text-lg font-semibold">Rules</h3>

                  <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-2">
                    <li>Unibridge activity points contribute 60% weight to Final Score.</li>
                    <li>Staking points contribute 40% weight to Final Score.</li>
                    <li>Anti-spam protections may apply in future (caps and filters).</li>
                    <li>Exact airdrop eligibility rules will be announced later.</li>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
