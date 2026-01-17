import { cn } from "@/lib/utils";

export type TabKey = "overview" | "transactions" | "staking" | "leaderboard" | "rules";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
  { key: "staking", label: "Staking" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "rules", label: "Rules" },
];

export function TabsNav({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "px-4 py-2 rounded-xl border text-sm transition",
            value === t.key
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card/40 border-border hover:bg-card/70"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
