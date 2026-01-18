import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  const wallet = req.query.wallet?.toLowerCase();
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const sb = supabaseServer();

  // 1. Get the pre-calculated rank and score from the view we created
  // This is much faster than manual calculation in the API
  const { data: rankData, error: rankError } = await sb
    .from('leaderboard_view')
    .select('*')
    .eq('wallet', wallet)
    .single();

  // 2. Get the specific ledger totals
  const { data: ledger } = await sb
    .from("points_ledger")
    .select("category, points")
    .eq("wallet", wallet);

  let unibridgePoints = 0;
  let stakingPoints = 0;

  for (const row of ledger || []) {
    if (row.category === "UNIBRIDGE_TX" || row.category === "CONNECT") {
        unibridgePoints += Number(row.points);
    }
    if (row.category === "STAKING_DAILY") {
        stakingPoints += Number(row.points);
    }
  }

  // 3. Return the data in a clean format
  // We use the rankData from our database view for the most accurate results
  return res.status(200).json({
    wallet,
    unibridgePoints: Math.floor(unibridgePoints),
    stakingPoints: Math.floor(stakingPoints),
    totalScore: Math.floor(rankData?.total_score || (unibridgePoints * 0.6 + stakingPoints * 0.4)),
    rank: rankData?.rank || "--"
  });
}