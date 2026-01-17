import { motion } from "framer-motion";
import { ExternalLink, Sun, Moon } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { useEffect, useState } from "react";

interface HeaderProps {
  isConnected: boolean;
  wallet?: string;
  onConnect: () => void;
}

export function Header({ isConnected, wallet, onConnect }: HeaderProps) {
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

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-5 px-8 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50"
    >
      {/* ✅ LEFT BRAND */}
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-3">
          {/* Logo square */}
          <div className="relative w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src="/unibridge-u (1).svg"
              alt="UniBridge"
              className="w-7 h-7 object-contain"
            />
          </div>

          {/* Text */}
          <div className="leading-tight">
            <h1 className="text-[22px] font-semibold tracking-tight">
              UniBridge
            </h1>
            <p className="text-xs text-muted-foreground">Points Program</p>
          </div>
        </a>
      </div>

      {/* ✅ RIGHT NAV + BUTTONS */}
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="https://unibridge.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Unibridge App <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://lp.kima.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Stake $KIMA <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://explorer.kima.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* ✅ Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* ✅ Wallet Button */}
        <WalletConnect isConnected={isConnected} wallet={wallet} onConnect={onConnect} />
      </div>
    </motion.header>
  );
}
