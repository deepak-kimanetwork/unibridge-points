import { supabaseServer } from "../../../lib/supabaseServer";

function requireCronSecret(req) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET) return true; // allow if not set
  return secret === process.env.CRON_SECRET;
}

export default async function handler(req, res) {
  if (!requireCronSecret(req)) {
    return res.status(401).json({ error: "Unauthorized cron" });
  }

  const sb = supabaseServer();

  // Load config
  const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
  const cfg = cfgRow?.config || {};
  const unibridgeCfg = cfg.unibridge || {};

  const basePoints = Number(unibridgeCfg.base_points ?? 30);
  const volumeMult = Number(unibridgeCfg.volume_multiplier ?? 2);

  // Get pending actions
  const { data: pending, error } = await sb
    .from("unibridge_actions")
    .select("*")
    .eq("status", "pending")
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });

  // ⚠️ IMPORTANT:
  // Here you must plug in the KIMA/Widget status API call using tx_id.
  // For now we provide "mock success logic" if meta.success === true.
  // Your team can replace this with the real status call immediately.

  let processed = 0;
  let credited = 0;

  for (const a of pending || []) {
    processed++;

    // ===== Replace this block with REAL tx status check =====
    // Expected: status = "success" | "failed" | "pending"
    const statusFromMeta = a.meta?.status || "pending";
    let finalStatus = statusFromMeta;
    // =======================================================

    if (finalStatus === "pending") continue;

    // Update action status
    await sb
      .from("unibridge_actions")
      .update({ status: finalStatus, updated_at: new Date().toISOString() })
      .eq("tx_id", a.tx_id);

    if (finalStatus !== "success") continue;

    // Prevent double crediting
    const { data: already } = await sb
      .from("points_ledger")
      .select("id")
      .eq("wallet", a.wallet)
      .eq("category", "UNIBRIDGE_TX")
      .eq("ref_id", a.tx_id)
      .limit(1);

    if (already && already.length > 0) continue;

    const usdValue = Number(a.usd_value ?? 0);
    const points = basePoints + Math.floor(usdValue * volumeMult);

    await sb.from("points_ledger").insert({
      wallet: a.wallet,
      category: "UNIBRIDGE_TX",
      points,
      usd_value: usdValue,
      ref_id: a.tx_id,
      meta: {
        action_type: a.action_type,
        note: "Auto-awarded on success"
      }
    });

    credited++;
  }

  return res.json({ ok: true, processed, credited });
}
