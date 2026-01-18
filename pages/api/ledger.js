import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: "Wallet required" });

  const sb = supabaseServer();

  // Fetch the last 50 points events for this wallet
  const { data, error } = await sb
    .from("points_ledger")
    .select("*")
    .eq("wallet", wallet.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ error: error.message });

  // Return local-friendly format (handling the 'rows' issue if necessary)
  return res.status(200).json(data || []);
}