import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const sb = supabaseServer();

  // upsert user
  await sb.from("users").upsert({ wallet, last_login_at: new Date().toISOString() });

  // connect bonus only once
  const { data: existing } = await sb
    .from("points_ledger")
    .select("id")
    .eq("wallet", wallet)
    .eq("category", "CONNECT")
    .limit(1);

  if (!existing || existing.length === 0) {
    // get connect bonus from config
    const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
    const bonus = cfgRow?.config?.connect_bonus ?? 50;

    await sb.from("points_ledger").insert({
      wallet,
      category: "CONNECT",
      points: bonus,
      ref_id: "connect_bonus"
    });
  }

  return res.json({ ok: true });
}
