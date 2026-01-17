import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletConnectProps {
  onConnect: (wallet: string) => void;
  isConnected: boolean;
  wallet?: string;
}

export function WalletConnect({ onConnect, isConnected, wallet }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showBonus, setShowBonus] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockWallet = '0x7a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b';
    onConnect(mockWallet);
    setIsConnecting(false);
    setShowBonus(true);
    
    setTimeout(() => setShowBonus(false), 3000);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showBonus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/50 text-success">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">+50 Connect Bonus!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isConnected ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary border border-border"
        >
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <code className="text-sm font-mono">
            {wallet?.slice(0, 6)}...{wallet?.slice(-4)}
          </code>
          <Check className="w-4 h-4 text-success" />
        </motion.div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          {isConnecting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Wallet className="w-4 h-4 mr-2" />
            </motion.div>
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}
