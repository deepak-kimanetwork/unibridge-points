import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Trophy, Lock, Repeat } from "lucide-react";

import { Header } from "@/components/points/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background unibridge-bg relative">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Light gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent dark:hidden" />
        {/* Dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent hidden dark:block" />
      </div>

      {/* Header (same as points/leaderboard) */}
      <Header isConnected={false} wallet={""} onConnect={() => {}} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="unibridge-card unibridge-glow p-10"
        >
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-primary">Earn Points.</span>{" "}
            <span className="text-foreground">Get Rewarded.</span>
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            UniBridge Points rewards activity across UniBridge transactions and
            $KIMA staking. Track your score and compete on the leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="/points"
              className="unibridge-btn inline-flex items-center gap-2 px-6 py-3"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://unibridge.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-secondary border border-border hover:bg-secondary/80 transition-colors inline-flex items-center gap-2"
            >
              Open UniBridge <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Feature cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <Repeat className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-base font-semibold">UniBridge Transactions</p>
              <p className="text-sm text-muted-foreground mt-1">
                Earn points for swaps, bridging, and onramp activity.
              </p>
            </div>

            <div className="stat-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-base font-semibold">$KIMA Staking</p>
              <p className="text-sm text-muted-foreground mt-1">
                Earn staking points daily based on pools and lock durations.
              </p>
            </div>

            <div className="stat-card border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-secondary">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-base font-semibold">Leaderboard</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check your rank anytime and prepare for upcoming airdrops.
              </p>
            </div>
          </div>

          {/* Bottom line + Powered by badge */}
          <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Powered by KIMA Network • Universal cross-chain finance • Transparent explorer tracking
            </p>

            {/* UniBridge style badge */}
            <div className="unibridge-pill">
              POWERED BY <span className="font-semibold">Kima Network</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
