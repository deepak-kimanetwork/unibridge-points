import { motion } from 'framer-motion';
import { Info, Coins, Lock, Gift, Shield, Calculator } from 'lucide-react';
import { SCORING_CONFIG, POOL_MULTIPLIERS } from '@/lib/mock-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function RulesPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Card */}
      <div className="glow-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-display font-bold">How Points Work</h2>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          Earn points by using Unibridge for swaps, bridges, and onramps, as well as staking $KIMA tokens. 
          Your Total Score is calculated using a weighted formula that rewards both activity and commitment.
        </p>
        
        <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <p className="font-mono text-sm text-center">
            Total Score = (Unibridge Points × <span className="text-primary">{SCORING_CONFIG.weights.unibridge}</span>) + 
            (Staking Points × <span className="text-accent">{SCORING_CONFIG.weights.staking}</span>)
          </p>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="space-y-3">
        {/* Unibridge Points */}
        <AccordionItem value="unibridge" className="glow-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-semibold">Unibridge Points</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Earn points for every successful transaction through Unibridge.ai including swaps, bridges, and onramps.
              </p>
              
              <div className="p-4 rounded-lg bg-secondary/50 border border-border font-mono text-sm">
                <p className="text-center mb-2">Points per Transaction:</p>
                <p className="text-center">
                  {SCORING_CONFIG.unibridge.base_points} + (USD Value × {SCORING_CONFIG.unibridge.volume_multiplier})
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Max TX/Day</p>
                  <p className="font-display font-bold text-lg">{SCORING_CONFIG.unibridge.max_tx_per_day}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Max USD/Day</p>
                  <p className="font-display font-bold text-lg">${SCORING_CONFIG.unibridge.max_usd_volume_per_day.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Staking Points */}
        <AccordionItem value="staking" className="glow-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <span className="font-display font-semibold">Staking Points</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Stake $KIMA tokens on lp.kima.network to earn daily points. Longer lock periods receive higher multipliers.
              </p>
              
              <div className="p-4 rounded-lg bg-secondary/50 border border-border font-mono text-sm">
                <p className="text-center mb-2">Daily Staking Points:</p>
                <p className="text-center">
                  √(Staked KIMA) × {SCORING_CONFIG.staking.base_multiplier} × Pool Multiplier
                </p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-medium mb-3">Pool Multipliers</h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(POOL_MULTIPLIERS).map(([days, multiplier]) => (
                    <div key={days} className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="text-xs text-muted-foreground">{days}d</p>
                      <p className="font-display font-bold text-primary">{multiplier}x</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Daily Cap</p>
                <p className="font-display font-bold text-lg">{SCORING_CONFIG.staking.daily_cap.toLocaleString()} pts</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Connect Bonus */}
        <AccordionItem value="bonus" className="glow-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Gift className="w-5 h-5 text-success" />
              </div>
              <span className="font-display font-semibold">Connect Bonus</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to the Points Dashboard to receive a one-time bonus.
            </p>
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 text-center">
              <p className="text-3xl font-display font-bold text-success">+{SCORING_CONFIG.connect_bonus}</p>
              <p className="text-sm text-muted-foreground mt-1">One-time bonus</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Anti-Abuse */}
        <AccordionItem value="security" className="glow-card px-6 border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-display font-semibold">Anti-Abuse Measures</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Points only awarded for successful transactions (failed/reverted do not earn)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Daily caps on transaction count and USD volume prevent spam farming
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Square root formula for staking prevents whale domination
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Unique transaction ID tracking prevents double-counting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Final airdrop eligibility subject to additional verification
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
}
