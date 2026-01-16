import { supabaseServer } from "../../../lib/supabaseServer";

function requireCronSecret(req) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET) return true;
  return secret === process.env.CRON_SECRET;
}

function sqrtPoints(stakedKima, baseMultiplier, poolMultiplier) {
  const s = Math.max(Number(stakedKima || 0), 0);
  return Math.floor(Math.sqrt(s) * Number(baseMultiplier) * Number(poolMultiplier));
}

export default async function handler(req, res) {
  if (!requireCronSecret(req)) {
    return res.status(401).json({ error: "Unauthorized cron" });
  }

  const sb = supabaseServer();

  // Load config
  const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
  const cfg = cfgRow?.config || {};
  const stakingCfg = cfg.staking || {};

  const baseMultiplier = Number(stakingCfg.base_multiplier ?? 6);
  const dailyCap = Number(stakingCfg.daily_cap ?? 20000);
  const pools = stakingCfg.pools || { "30": 1.0, "60": 1.15, "90": 1.3, "180": 1.6, "360": 2.0 };

  const snapshotDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC

  // Pull current balances
  const { data: balances, error } = await sb
    .from("staking_balances")
    .select("*");

  if (error) return res.status(500).json({ error: error.message });

  let awarded = 0;
  let walletsProcessed = 0;

  // Aggregate daily points per wallet to apply cap
  const perWallet = new Map();

  for (const b of balances || []) {
    const poolId = String(b.pool_id);
    const poolMult = Number(pools[poolId] ?? 1.0);

    const pts = sqrtPoints(b.staked_amount, baseMultiplier, poolMult);

    const key = b.wallet;
    if (!perWallet.has(key)) perWallet.set(key, []);
    perWallet.get(key).push({
      wallet: b.wallet,
      pool_id: b.pool_id,
      staked_amount: b.staked_amount,
      points: pts
    });
  }

  for (const [wallet, rows] of perWallet.entries()) {
    walletsProcessed++;

    // apply daily cap
    const total = rows.reduce((acc, r) => acc + r.points, 0);
    const ratio = total > dailyCap ? dailyCap / total : 1;

    for (const r of rows) {
      const pointsFinal = Math.floor(r.points * ratio);

      // avoid duplicates (if job runs twice same day)
      const { data: exists } = await sb
        .from("staking_daily_snapshots")
        .select("snapshot_date")
        .eq("snapshot_date", snapshotDate)
        .eq("wallet", r.wallet)
        .eq("pool_id", r.pool_id)
        .limit(1);

      if (exists && exists.length > 0) continue;

      await sb.from("staking_daily_snapshots").insert({
        snapshot_date: snapshotDate,
        wallet: r.wallet,
        pool_id: r.pool_id,
        staked_amount: r.staked_amount,
        points_awarded: pointsFinal
      });

      await sb.from("points_ledger").insert({
        wallet: r.wallet,
        category: "STAKING_DAILY",
        points: pointsFinal,
        ref_id: `${snapshotDate}:${r.pool_id}`,
        meta: {
          pool_id: r.pool_id,
          snapshot_date: snapshotDate
        }
      });

      awarded++;
    }
  }

  return res.json({ ok: true, snapshotDate, walletsProcessed, awarded });
}
