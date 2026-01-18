import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const sb = supabaseServer();

  // Fetch the 10 most recent actions for this wallet
  const { data, error } = await sb
    .from("unibridge_actions")
    .select("tx_id, action_type, status, usd_value, created_at")
    .eq("wallet", wallet.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
}
