import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { txId, wallet, actionType, usdValue, meta } = req.body;

  if (!txId || !wallet) {
    return res.status(400).json({ error: "txId and wallet required" });
  }

  const sb = supabaseServer();

  // store user
  await sb.from("users").upsert({ wallet, last_login_at: new Date().toISOString() });

  // store action (pending)
  await sb.from("unibridge_actions").upsert({
    tx_id: txId,
    wallet,
    action_type: actionType || "unibridge",
    status: "pending",
    usd_value: usdValue || null,
    meta: meta || {}
  });

  return res.json({ ok: true });
}
