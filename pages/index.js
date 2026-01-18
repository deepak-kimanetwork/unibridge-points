import { motion } from "framer-motion";
import { ArrowRight, Trophy, Lock, Repeat } from "lucide-react";
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Header } from "@/components/points/Header";
import Link from 'next/link';

export default function Home() {
  const { isConnected } = useAccount();
  const { open } = useAppKit();

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Optimized subtle glow effect instead of heavy images/gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <Header />

      <main className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="unibridge-card border border-white/5 bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            <span className="text-primary">Earn Points.</span><br />
            <span className="text-white">Get Rewarded.</span>
          </h1>

          <p className="mt-6 text-xl text-slate-400 max-w-2xl leading-relaxed">
            UniBridge Points rewards activity across UniBridge transactions and
            $KIMA staking. Track your score, refer friends, and compete on the global leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            {isConnected ? (
              <Link
                href="/points"
                className="unibridge-btn inline-flex items-center gap-2 px-8 py-4 text-lg font-bold"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                onClick={() => open()}
                className="unibridge-btn inline-flex items-center gap-2 px-8 py-4 text-lg font-bold"
              >
                Connect Wallet <ArrowRight className="w-5 h-5" />
              </button>
            )}

            <Link
              href="/leaderboard"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold inline-flex items-center gap-2"
            >
              View Rankings <Trophy className="w-5 h-5 text-primary" />
            </Link>
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-colors">
              <div className="p-3 w-fit rounded-xl bg-primary/10 mb-4">
                <Repeat className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-bold">UniBridge Activity</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Earn 60% of your score through swaps, bridging, and onramp activity via the UniBridge widget.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-colors">
              <div className="p-3 w-fit rounded-xl bg-primary/10 mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-bold">$KIMA Staking</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Earn 40% of your score daily based on your active staking positions and lock durations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-colors">
              <div className="p-3 w-fit rounded-xl bg-primary/10 mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <p className="text-lg font-bold">Airdrop Ready</p>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Climb the unique leaderboard and qualify for exclusive ecosystem rewards and airdrops.
              </p>
            </div>
          </div>

          {/* Bottom line + Powered by badge */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
              Powered by KIMA Network • Universal Cross-Chain Finance
            </p>

            <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-[10px] font-black tracking-tighter rounded-lg">
              ECOSYSTEM PARTNER: <span className="text-primary">KIMA NETWORK</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}