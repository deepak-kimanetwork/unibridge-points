import { supabaseServer } from "../../../lib/supabaseServer";

function shortWallet(w) {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

export default async function handler(req, res) {
  const limit = Number(req.query.limit || 50);
  const sb = supabaseServer();

  const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
  const cfg = cfgRow?.config;
  const weights = cfg?.weights || { unibridge: 0.6, staking: 0.4 };

  const { data: wallets } = await sb.from("users").select("wallet");

  const rows = [];
  for (const u of wallets || []) {
    const { data: ledger } = await sb
      .from("points_ledger")
      .select("category, points")
      .eq("wallet", u.wallet);

    let unibridgePoints = 0;
    let stakingPoints = 0;

    for (const row of ledger || []) {
      if (row.category === "UNIBRIDGE_TX") unibridgePoints += Number(row.points);
      if (row.category === "STAKING_DAILY") stakingPoints += Number(row.points);
      if (row.category === "CONNECT") unibridgePoints += Number(row.points);
    }

    const totalScore =
      unibridgePoints * (weights.unibridge ?? 0.6) +
      stakingPoints * (weights.staking ?? 0.4);

    rows.push({
      wallet: u.wallet,
      walletShort: shortWallet(u.wallet),
      unibridgePoints: Math.floor(unibridgePoints),
      stakingPoints: Math.floor(stakingPoints),
      totalScore: Math.floor(totalScore)
    });
  }

  rows.sort((a, b) => b.totalScore - a.totalScore);

  return res.json({ rows: rows.slice(0, limit) });
}
