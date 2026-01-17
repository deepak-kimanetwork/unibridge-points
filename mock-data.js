export function formatNumber(value) {
  const n = Number(value ?? 0);

  if (!Number.isFinite(n)) return "0";

  // 1000 -> 1K, 1500000 -> 1.5M
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  }).format(n);
}
