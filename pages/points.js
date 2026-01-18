import { useEffect, useState } from "react";
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Coins, Lock, BarChart3, ArrowRight, Users, Copy, Check, History, BookOpen } from "lucide-react";

import { Header } from "@/components/points/Header";
import { DEFAULT_WEIGHTS } from "@/lib/utils";
import { StatCard } from "@/components/points/StatCard";
import { TabsNav } from "@/components/points/TabsNav";

export default function Points() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  async function refresh(w) {
    if (!w) return;
    const walletAddr = w.toLowerCase();
    try {
      const resPoints = await fetch(`/api/points/summary?wallet=${walletAddr}`);
      const jsonPoints = await resPoints.json();
      const summaryData = jsonPoints.rows ? jsonPoints.rows[0] : jsonPoints;
      
      setData({
        totalScore: Number(summaryData?.totalScore || summaryData?.total_score || 0),
        unibridgePoints: Number(summaryData?.unibridgePoints || summaryData?.unibridge_points || 0),
        stakingPoints: Number(summaryData?.stakingPoints || summaryData?.staking_points || 0),
        referralPoints: Number(summaryData?.referralPoints || summaryData?.referral_points || 0),
        referralCount: Number(summaryData?.referralCount || summaryData?.referral_count || 0),
        rank: summaryData?.rank || "--"
      });

      const resTx = await fetch(`/api/unibridge/list?wallet=${walletAddr}`);
      const jsonTx = await resTx.json();
      setTransactions(Array.isArray(jsonTx) ? jsonTx : (jsonTx.rows || []));
    } catch (err) { 
      console.error("Dashboard Sync Error:", err); 
    }
  }

  useEffect(() => {
    if (isConnected && address) refresh(address);
  }, [isConnected, address]);

  const copyLink = () => {
    const link = `https://unibridge.ai?ref=${address?.toLowerCase().slice(2, 10)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-10 relative z-10">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div key="connect" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <h1 className="text-5xl font-black mb-6 tracking-tight">Earn <span className="text-primary">UniBridge</span> Points</h1>
              <button onClick={() => open()} className="unibridge-btn px-10 py-4 text-lg font-bold inline-flex items-center gap-2">
                Connect Wallet <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Final Score" value={data?.totalScore || 0} icon={Trophy} variant="primary" subtitle={data?.rank ? `Rank #${data.rank}` : "Calculating..."} />
                <StatCard title="Staking Earned" value={data?.stakingPoints || 0} icon={Lock} variant="accent" />
                <StatCard title="Referral Earnings" value={data?.referralPoints || 0} icon={Users} subtitle={`${data?.referralCount || 0} Friends Invited`} />
                <StatCard title="Weight Split" value={`${(DEFAULT_WEIGHTS?.unibridge || 0.6) * 100} / ${(DEFAULT_WEIGHTS?.staking || 0.4) * 100}`} icon={BarChart3} subtitle="UniBridge / Staking" />
              </div>

              {/* REFERRAL BOX */}
              <div className="unibridge-card p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
                      <Users className="w-5 h-5 text-primary" /> Share your link
                    </h3>
                    <p className="text-sm text-muted-foreground">Friends get 250 points. You get 10% of their earnings.</p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <div className="flex-1 bg-black/40 border border-white/10 px-4 py-2 rounded-xl font-mono text-xs flex items-center min-w-[240px] overflow-hidden">
                      unibridge.ai?ref={address?.toLowerCase().slice(2, 10)}
                    </div>
                    <button onClick={copyLink} className="unibridge-btn px-4 py-2 flex items-center gap-2 min-w-[120px] justify-center">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>

              <TabsNav value={tab} onChange={setTab} />

              <div className="mt-6 min-h-[300px]">
                {tab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="unibridge-card p-6 border border-white/5 bg-white/5 rounded-2xl">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="w-4 h-4"/> Recent Activity</h3>
                      {transactions.length > 0 ? (
                        <div className="space-y-3">
                          {transactions.map((tx) => (
                            <div key={tx.tx_id || tx.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                              <div><p className="text-sm font-bold uppercase">{tx.action_type || 'TX'}</p></div>
                              <div className="text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.status === 'verified' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>{tx.status}</span>
                                <p className="text-sm font-black mt-1">${tx.usd_value || 0}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-muted-foreground py-10 text-center">No transactions found.</p>}
                    </div>
                    <div className="unibridge-card p-6 border border-white/5 bg-white/5 rounded-2xl flex flex-col justify-center items-center text-center">
                       <Lock className="w-12 h-12 text-primary/40 mb-4" />
                       <h3 className="text-lg font-bold">Staking Multiplier</h3>
                       <p className="text-sm text-muted-foreground max-w-[250px]">Your $KIMA stakes are indexed every 24 hours.</p>
                    </div>
                  </div>
                )}
                {tab === "transactions" && (
                   <div className="unibridge-card p-8 border border-white/5 bg-white/5 rounded-2xl">
                     <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                     <p className="text-muted-foreground">Detailed logs of your UniBridge widget activity will appear here.</p>
                   </div>
                )}
                {tab === "rules" && (
                   <div className="unibridge-card p-8 border border-white/5 bg-white/5 rounded-2xl">
                     <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Points System Rules</h2>
                     <ul className="space-y-4 text-sm text-muted-foreground">
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"/><span><strong>UniBridge:</strong> 10 points per $1 bridged.</span></li>
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"/><span><strong>Staking:</strong> Daily points based on pool duration.</span></li>
                        <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"/><span><strong>Referrals:</strong> 10% lifetime commission.</span></li>
                     </ul>
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}