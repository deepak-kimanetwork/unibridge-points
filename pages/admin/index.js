import { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import { 
  Search, Save, User, Settings, ArrowLeft, ShieldAlert, Lock, 
  Download, PlusCircle, Users, Eye, Database, Trophy, Copy, Check, Sun, Moon 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/router';

// ✅ ADMIN WALLET
const ADMIN_WALLET = "0x3344BEEd6bED5079bf57B63a72d8823Ec402022d".toLowerCase();

export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Manual Adjustment States
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  // Config States
  const [refBonus, setRefBonus] = useState(200);
  const [connBonus, setConnBonus] = useState(50);

  useEffect(() => {
    if (isConnected && address) {
      if (address.toLowerCase() === ADMIN_WALLET) {
        setIsAdmin(true);
        fetchUserList();
      } else {
        setTimeout(() => router.push('/points'), 3000);
      }
    }
  }, [address, isConnected, router]);

  const fetchUserList = async () => {
    try {
      const res = await fetch('/api/admin/list-users');
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : (data.rows || []));
    } catch (err) {
      console.error("Failed to load user list");
    }
  };

  const handleSearch = async (walletToSearch) => {
    const target = walletToSearch || searchQuery;
    if (!target || !isAdmin) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/user-search?wallet=${target}`);
      const data = await res.json();
      setUserData(data);
      if (!walletToSearch) setSearchQuery(target);
    } catch (err) {
      alert("Search failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!userData?.profile?.wallet) return;
    const res = await fetch("/api/admin/adjust-points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminWallet: address,
        targetWallet: userData.profile.wallet,
        amount: adjustAmount,
        reason: adjustReason
      }),
    });
    const result = await res.json();
    if (result.ok) {
      alert("Points Adjusted Successfully!");
      handleSearch(userData.profile.wallet);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    window.location.href = `/api/admin/export-data?adminWallet=${address}`;
  };

  if (!isConnected || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-[2.5rem] text-center space-y-6 backdrop-blur-xl">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-white">Restricted Area</h1>
          <p className="text-white/40">{!isConnected ? "Please Connect Admin Wallet" : "Unauthorized Wallet. Redirecting..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} p-4 md:p-8 font-sans selection:bg-primary/30`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 border border-primary/30 p-3 rounded-2xl shadow-[0_0_20px_rgba(0,210,255,0.15)]">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className={`text-3xl font-black tracking-tight uppercase italic ${!isDarkMode && 'text-slate-900'}`}>Admin Console</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className={`${isDarkMode ? 'text-white/30' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-[0.3em]`}>Secure Node: Verified</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <Link href="/points" className={`flex-1 md:flex-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border px-6 py-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <ArrowLeft className="w-4 h-4" /> Exit
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: LIST & CONFIG */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* USER BROWSER LIST */}
            <section className={`border rounded-[2rem] p-6 backdrop-blur-md shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
                <Users className="w-4 h-4" /> User Database
              </h2>
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {allUsers.length > 0 ? allUsers.map((u) => (
                  <button 
                    key={u.wallet} 
                    onClick={() => handleSearch(u.wallet)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all group flex justify-between items-center ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:border-primary/50 hover:bg-primary/5' : 'bg-slate-50 border-slate-100 hover:border-primary/50'}`}
                  >
                    <div>
                      <p className={`text-xs font-mono font-bold ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>{u.wallet.slice(0,6)}...{u.wallet.slice(-4)}</p>
                      <p className={`text-[9px] uppercase font-black mt-1 ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Click to Inspect</p>
                    </div>
                    <Eye className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-white/10' : 'text-slate-300'} group-hover:text-primary`} />
                  </button>
                )) : (
                  <p className="text-xs text-white/20 text-center py-10">No users found...</p>
                )}
              </div>
            </section>

            {/* GLOBAL CONFIG */}
            <section className={`border rounded-[2rem] p-6 backdrop-blur-md shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
                <Settings className="w-4 h-4" /> Global Control
              </h2>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Referral Reward</label>
                  <input type="number" value={refBonus} onChange={(e)=>setRefBonus(e.target.value)} className={`w-full p-4 border rounded-2xl font-mono text-sm focus:border-primary/50 outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Connect Reward</label>
                  <input type="number" value={connBonus} onChange={(e)=>setConnBonus(e.target.value)} className={`w-full p-4 border rounded-2xl font-mono text-sm focus:border-primary/50 outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
                {/* Fixed Visibility Button */}
                <button className="w-full bg-primary text-[#050505] py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(0,210,255,0.4)] transition-all active:scale-[0.98]">
                  Commit Logic Update
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SEARCH & INSPECTION */}
          <div className="lg:col-span-8 space-y-8">
            <section className={`border rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-primary">
                <Database className="w-4 h-4" /> Wallet Inspection
              </h2>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3 mb-10">
                <input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Paste wallet address (0x...)" 
                  className={`flex-1 border p-4 rounded-2xl outline-none focus:border-primary/50 transition-all font-mono ${isDarkMode ? 'bg-black/40 border-white/5 text-white placeholder:text-white/10' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                />
                {/* Fixed Visibility Button */}
                <button type="submit" className="bg-primary text-[#050505] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all active:scale-[0.98]">
                  {loading ? "..." : "Analyze"}
                </button>
              </form>

              {userData ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* ✅ FULL WALLET ADDRESS DISPLAY SECTION */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                      <p className={`text-xs font-mono font-bold truncate ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                        {userData.profile?.wallet}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleCopy(userData.profile?.wallet)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${copied ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-primary border-primary/20 bg-primary/5 hover:bg-primary hover:text-black'}`}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Cumulative Points</p>
                      <p className={`text-5xl font-black ${!isDarkMode && 'text-slate-900'}`}>{(userData.summary?.total_points || 0).toLocaleString()} <span className="text-xs font-normal text-primary/40 uppercase">PTS</span></p>
                    </div>
                    <div className={`p-8 rounded-[2rem] border relative overflow-hidden group ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className={`w-12 h-12 ${isDarkMode ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>Referral Network</p>
                      <p className={`text-5xl font-black ${!isDarkMode && 'text-slate-900'}`}>{(userData.referrals?.length || 0)} <span className={`text-xs font-normal uppercase ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`}>Users</span></p>
                    </div>
                  </div>

                  {/* Manual Adjustment */}
                  <div className={`p-8 rounded-[2rem] border border-dashed ${isDarkMode ? 'bg-white/[0.01] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-red-500/80">
                      <PlusCircle className="w-3 h-3"/> Override Logic
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <input type="number" placeholder="Amount (+/-)" value={adjustAmount} onChange={(e)=>setAdjustAmount(e.target.value)} className={`p-4 border rounded-2xl text-sm flex-1 font-mono outline-none focus:border-red-500/30 ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                      <input type="text" placeholder="Adjustment Reason" value={adjustReason} onChange={(e)=>setAdjustReason(e.target.value)} className={`p-4 border rounded-2xl text-sm flex-[2] outline-none focus:border-red-500/30 ${isDarkMode ? 'bg-black/40 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                      <button onClick={handleAdjustment} className="bg-red-500/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        Execute
                      </button>
                    </div>
                  </div>

                  {/* Audit Log Table */}
                  <div className="space-y-4">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Ledger Event Log</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {(userData.ledger || []).length > 0 ? (userData.ledger || []).map((item, i) => (
                        <div key={i} className={`flex justify-between items-center p-5 border rounded-2xl transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
                          <div>
                            <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>{item.category}</p>
                            <p className={`text-[10px] italic mt-0.5 ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>{item.description}</p>
                          </div>
                          <p className={`font-black text-sm tracking-tighter ${item.points >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            {item.points > 0 ? '+' : ''}{item.points}
                          </p>
                        </div>
                      )) : (
                        <p className="text-xs text-white/10 text-center py-10">No events recorded for this node.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`py-24 text-center border-2 border-dashed rounded-[3rem] ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <Search className={`w-6 h-6 ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`} />
                  </div>
                  <p className={`font-bold uppercase tracking-widest text-xs ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Ready for Analysis</p>
                  <p className={`text-[10px] mt-2 italic ${isDarkMode ? 'text-white/10' : 'text-slate-300'}`}>Select a wallet from the registry or input a hash above</p>
                </div>
              )}
            </section>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00d2ff; }
        ${!isDarkMode ? '.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }' : ''}
      `}</style>
    </div>
  );
}