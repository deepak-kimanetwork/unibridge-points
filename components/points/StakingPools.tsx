import { motion } from 'framer-motion';
import { Lock, TrendingUp, Clock } from 'lucide-react';
import { StakingPosition, POOL_COLORS, POOL_MULTIPLIERS, formatNumber, daysRemaining } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';

interface StakingPoolsProps {
  positions: StakingPosition[];
}

export function StakingPools({ positions }: StakingPoolsProps) {
  const allPools = [30, 60, 90, 180, 360];
  
  return (
    <div className="space-y-4">
      {allPools.map((poolId, index) => {
        const position = positions.find(p => p.poolId === poolId);
        const hasPosition = !!position;
        
        return (
          <motion.div
            key={poolId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glow-card p-5 ${hasPosition ? '' : 'opacity-50'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${POOL_COLORS[poolId]}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{poolId} Day Pool</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    <span>{POOL_MULTIPLIERS[poolId]}x multiplier</span>
                  </div>
                </div>
              </div>
              
              {hasPosition && (
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-primary">
                    +{formatNumber(position.dailyPoints)}
                  </p>
                  <p className="text-sm text-muted-foreground">pts/day</p>
                </div>
              )}
            </div>
            
            {hasPosition ? (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Staked Amount</span>
                  <span className="font-medium">{formatNumber(position.stakedAmount)} $KIMA</span>
                </div>
                
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Time Remaining
                  </span>
                  <span className="font-medium">{daysRemaining(position.lockEndDate)} days</span>
                </div>
                
                <Progress 
                  value={((poolId - daysRemaining(position.lockEndDate)) / poolId) * 100} 
                  className="h-2 bg-secondary"
                />
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No active position</p>
                <a 
                  href="https://lp.kima.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-1 inline-block"
                >
                  Stake $KIMA to earn points →
                </a>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
