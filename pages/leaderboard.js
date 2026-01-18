import { useEffect, useState } from "react";
import { useAccount } from 'wagmi';
import { Header } from "@/components/points/Header";
import { Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";

const shortWallet = (w) => (w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "");

export default function LeaderboardPage() {
  const { address, isConnected } = useAccount();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRankData, setUserRankData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/points/leaderboard");
        const json = await res.json();
        
        // Environment safe check
        const leaderboardData = Array.isArray(json) ? json : (json.rows || []);
        
        const formattedData = leaderboardData.map((item, index) => ({
          ...item,
          rank: item.rank || index + 1,
          total_score: Number(item.totalScore || item.total_score || 0)
        }));

        setLeaderboard(formattedData);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isConnected && address && leaderboard.length > 0) {
      const found = leaderboard.find(u => u.wallet?.toLowerCase() === address.toLowerCase());
      setUserRankData(found);
    } else {
      setUserRankData(null);
    }
  }, [isConnected, address, leaderboard]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground mt-2">Unique rankings based on points and activity time.</p>
        </div>

        {/* ✅ DYNAMIC PERSONAL RANK CARD */}
        {isConnected && address && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Your Standing</p>
                <p className="text-lg font-mono font-bold">{shortWallet(address)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary">
                {userRankData ? `#${userRankData.rank}` : "#--"}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Score: {userRankData ? userRankData.total_score.toLocaleString() : "0"}
              </p>
            </div>
          </motion.div>
        )}

        <div className="unibridge-card overflow-hidden border border-white/5 shadow-2xl bg-white/5 rounded-3xl backdrop-blur-sm">
          {loading ? (
            <div className="p-20 text-center text-muted-foreground animate-pulse">Calculating unique rankings...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-5 font-bold">Rank</th>
                    <th className="px-6 py-5 font-bold">Wallet</th>
                    <th className="px-6 py-5 font-bold text-right">Final Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.length > 0 ? leaderboard.map((user) => {
                    const isMe = isConnected && address && user.wallet?.toLowerCase() === address.toLowerCase();
                    return (
                      <tr key={user.wallet} className={`hover:bg-white/5 transition-colors ${isMe ? 'bg-primary/10' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            {user.rank === 1 && <Medal className="w-5 h-5 text-yellow-500" />}
                            {user.rank === 2 && <Medal className="w-5 h-5 text-slate-300" />}
                            {user.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                            <span className={`font-mono font-bold ${user.rank <= 3 ? 'text-lg text-primary' : 'text-sm text-slate-400'}`}>
                              #{user.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono text-sm">
                          <span className={isMe ? "text-primary font-bold" : "text-slate-200"}>
                            {shortWallet(user.wallet)}
                          </span>
                          {isMe && (
                            <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">You</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right font-black text-primary">
                          {user.total_score.toLocaleString()}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center text-muted-foreground">
                        No ranking data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}