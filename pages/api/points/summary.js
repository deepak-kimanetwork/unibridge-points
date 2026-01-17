import { supabaseServer } from "../../../lib/supabaseServer";

function shortWallet(w) {
  if (!w) return "";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

export default async function handler(req, res) {
  const wallet = req.query.wallet;
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const sb = supabaseServer();

  const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
  const cfg = cfgRow?.config;

  const weights = cfg?.weights || { unibridge: 0.6, staking: 0.4 };

  // sum ledger by category groups
  const { data: ledger } = await sb
    .from("points_ledger")
    .select("category, points")
    .eq("wallet", wallet);

  let unibridgePoints = 0;
  let stakingPoints = 0;

  for (const row of ledger || []) {
    if (row.category === "UNIBRIDGE_TX") unibridgePoints += Number(row.points);
    if (row.category === "STAKING_DAILY") stakingPoints += Number(row.points);
    if (row.category === "CONNECT") unibridgePoints += Number(row.points); // connect counts as Unibridge bucket
if (row.category === "REFERRAL_BONUS_REFERRED") unibridgePoints += Number(row.points);
if (row.category === "REFERRAL_EARN_REFERRER") unibridgePoints += Number(row.points);
  }

  const totalScore =
    unibridgePoints * Number(weights.unibridge ?? 0.6) +
    stakingPoints * Number(weights.staking ?? 0.4);

  // rank: compute naive rank based on total score (MVP)
  const { data: allWallets } = await sb.from("users").select("wallet");
  let rank = "-";
  if (allWallets?.length) {
    const scores = [];
    for (const u of allWallets) {
      const { data: uLedger } = await sb
        .from("points_ledger")
        .select("category, points")
        .eq("wallet", u.wallet);

      let uU = 0, uS = 0;
      for (const r of uLedger || []) {
        if (r.category === "UNIBRIDGE_TX") uU += Number(r.points);
        if (r.category === "STAKING_DAILY") uS += Number(r.points);
        if (r.category === "CONNECT") uU += Number(r.points);
      }
      const t = uU * (weights.unibridge ?? 0.6) + uS * (weights.staking ?? 0.4);
      scores.push({ wallet: u.wallet, totalScore: t });
    }
    scores.sort((a, b) => b.totalScore - a.totalScore);
    rank = scores.findIndex((s) => s.wallet === wallet) + 1;
  }

  return res.json({
    wallet,
    walletShort: shortWallet(wallet),
    unibridgePoints: Math.floor(unibridgePoints),
    stakingPoints: Math.floor(stakingPoints),
    totalScore: Math.floor(totalScore),
    rank
  });
}
