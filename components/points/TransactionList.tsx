import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Transaction, formatUSD, formatNumber, timeAgo } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

interface TransactionListProps {
  transactions: Transaction[];
}

const statusIcons = {
  success: CheckCircle2,
  pending: Clock,
  failed: XCircle,
};

const statusColors = {
  success: 'text-success',
  pending: 'text-warning',
  failed: 'text-destructive',
};

const typeLabels = {
  swap: 'Swap',
  bridge: 'Bridge',
  onramp: 'Onramp',
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((tx, index) => {
        const StatusIcon = statusIcons[tx.status];
        
        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glow-card p-4 table-row-hover cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-secondary ${statusColors[tx.status]}`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {typeLabels[tx.type]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tx.fromChain}
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {tx.toChain}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs text-muted-foreground font-mono">
                      {tx.txId}
                    </code>
                    <a 
                      href={`https://explorer.kima.network/tx/${tx.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3 text-primary" />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-display font-semibold text-primary">
                  +{formatNumber(tx.pointsEarned)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatUSD(tx.usdValue)} • {timeAgo(tx.timestamp)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
