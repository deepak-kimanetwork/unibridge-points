import { motion } from "framer-motion";
import { Trophy, ArrowRight, CreditCard } from "lucide-react";

export function ConnectHero({ onConnect }: { onConnect: () => void }) {
  return (
    <motion.div
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

      <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
        <a
          href="https://unibridge.ai"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-full bg-card/40 border border-border hover:bg-card/70 text-sm flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Swap, Bridge, Onramp
        </a>

        <a
          href="https://lp.kima.network"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-full bg-card/40 border border-border hover:bg-card/70 text-sm flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Stake $KIMA
        </a>

        <span className="px-4 py-2 rounded-full bg-card/40 border border-border text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Earn Airdrop
        </span>
      </div>

      <div className="mt-8">
        <button
          onClick={onConnect}
          className="unibridge-btn px-8 py-3 text-base font-semibold inline-flex items-center gap-2"
        >
          Connect MetaMask <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        Click “Connect Wallet” above to get started.
      </p>
    </motion.div>
  );
}
