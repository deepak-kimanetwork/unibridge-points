import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { formatNumber } from "@/lib/mock-data";

const shortenWallet = (wallet?: string) => {
  if (!wallet) return "";
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
};

interface LeaderboardProps {
  entries: any[];
  currentWallet?: string;
}

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
};

const rankColors = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

export function Leaderboard({ entries, currentWallet }: LeaderboardProps) {
  return (
    <div className="unibridge-card unibridge-glow p-6">
      <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm text-muted-foreground font-medium">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4">Wallet</div>
        <div className="col-span-2 text-right">Unibridge</div>
        <div className="col-span-2 text-right">Staking</div>
        <div className="col-span-3 text-right">Total Score</div>
      </div>

      {entries.map((entry, index) => {
        const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons];

        const isCurrentUser =
          currentWallet &&
          entry.wallet &&
          entry.wallet.toLowerCase() === currentWallet.toLowerCase();

        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-xl table-row-hover ${
              isCurrentUser ? "glow-card border-primary/50" : "bg-card/50"
            }`}
          >
            <div className="col-span-1 flex items-center">
              {RankIcon ? (
                <RankIcon
                  className={`w-5 h-5 ${
                    rankColors[entry.rank as keyof typeof rankColors]
                  }`}
                />
              ) : (
                <span className="text-muted-foreground font-medium">
                  #{entry.rank}
                </span>
              )}
            </div>

            <div className="col-span-4 flex items-center">
              <code className="text-sm font-mono">{shortenWallet(entry.wallet)}</code>
              {isCurrentUser && (
                <span className="ml-2 text-xs text-primary font-medium">(You)</span>
              )}
            </div>

            <div className="col-span-2 text-right text-muted-foreground">
              {formatNumber(entry.unibridgePoints)}
            </div>

            <div className="col-span-2 text-right text-muted-foreground">
              {formatNumber(entry.stakingPoints)}
            </div>

            <div className="col-span-3 text-right">
              <span className="font-display font-bold text-lg gradient-text">
                {formatNumber(entry.totalScore)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
