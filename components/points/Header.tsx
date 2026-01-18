import { motion } from "framer-motion";
import { ExternalLink, Sun, Moon, LayoutDashboard, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

export function Header() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  
  // ✅ Theme logic
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const t: "dark" | "light" = saved === "light" ? "light" : "dark";
    setTheme(t);
    if (t === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }

  const shortWallet = (w: string) => `${w.slice(0, 6)}...${w.slice(-4)}`;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-5 px-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50"
    >
      {/* ✅ LEFT BRAND */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src="/unibridge-u (1).svg"
              alt="UniBridge"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="leading-tight">
            <h1 className="text-[22px] font-semibold tracking-tight">
              UniBridge
            </h1>
            <p className="text-xs text-muted-foreground">Points Program</p>
          </div>
        </Link>
      </div>

      {/* ✅ CENTER NAV (Added navigation between pages) */}
      <nav className="hidden lg:flex items-center gap-6">
        <Link href="/points" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/leaderboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
          <Trophy className="w-4 h-4" /> Leaderboard
        </Link>
      </nav>

      {/* ✅ RIGHT NAV + BUTTONS */}
      <div className="flex items-center gap-4">
        <nav className="hidden xl:flex items-center gap-6">
          <a
            href="https://unibridge.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            App <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* ✅ Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* ✅ Multi-Wallet Universal Button */}
        <button
          onClick={() => open()}
          className="unibridge-btn px-5 py-2.5 text-sm font-bold min-w-[140px]"
        >
          {isConnected && address ? shortWallet(address) : "Connect Wallet"}
        </button>
      </div>
    </motion.header>
  );
}