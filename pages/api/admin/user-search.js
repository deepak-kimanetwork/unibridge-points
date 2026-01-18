import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  // Check for admin wallet in production
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "Wallet address required" });

  const sb = supabaseServer();
  const target = wallet.toLowerCase();

  try {
    // 1. Get User Profile & Referral Info
    const { data: user } = await sb.from("users").select("*").eq("wallet", target).single();

    // 2. Get Users they referred
    const { data: referrals } = await sb.from("users").select("wallet, created_at").eq("referred_by", target);

    // 3. Get Full Ledger (Audit Log)
    const { data: ledger } = await sb.from("points_ledger")
      .select("*")
      .eq("wallet", target)
      .order("created_at", { ascending: false });

    return res.json({
      profile: user,
      referrals: referrals || [],
      ledger: ledger || [],
      summary: {
        total_points: ledger?.reduce((acc, curr) => acc + curr.points, 0) || 0,
        referral_count: referrals?.length || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}