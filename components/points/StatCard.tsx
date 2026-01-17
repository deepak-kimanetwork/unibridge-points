import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { formatNumber } from '@/lib/mock-data';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: number;
  variant?: 'default' | 'primary' | 'accent';
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  trend,
  variant = 'default' 
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    primary: 'border-primary/30',
    accent: 'border-accent/30',
  };

  const iconBgStyles = {
    default: 'bg-secondary',
    primary: 'bg-primary/10',
    accent: 'bg-accent/10',
  };

  const iconColorStyles = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    accent: 'text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`stat-card ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBgStyles[variant]}`}>
          <Icon className={`w-6 h-6 ${iconColorStyles[variant]}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className={`text-3xl font-display font-bold tracking-tight ${
          variant === 'primary' ? 'text-glow gradient-text' : ''
        }`}>
          {formatNumber(value)}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
