import { supabaseServer } from "../../../lib/supabaseServer";

function requireCronSecret(req) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  // Fallback for your custom header if needed
  const secret = req.headers["x-cron-secret"];
  return secret === process.env.CRON_SECRET;
}

function sqrtPoints(stakedKima, baseMultiplier, poolMultiplier) {
  const s = Math.max(Number(stakedKima || 0), 0);
  return Math.floor(Math.sqrt(s) * Number(baseMultiplier) * Number(poolMultiplier));
}

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!requireCronSecret(req)) {
    return res.status(401).json({ error: "Unauthorized cron" });
  }

  const sb = supabaseServer();
  const snapshotDate = new Date().toISOString().slice(0, 10);

  try {
    // 1. Load Config
    const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
    const cfg = cfgRow?.config || {};
    const stakingCfg = cfg.staking || {};

    const baseMultiplier = Number(stakingCfg.base_multiplier ?? 6);
    const dailyCap = Number(stakingCfg.daily_cap ?? 20000);
    const pools = stakingCfg.pools || { "30": 1.0, "60": 1.15, "90": 1.3, "180": 1.6, "360": 2.0 };

    // 2. Pull Balances
    const { data: balances, error } = await sb.from("staking_balances").select("*");
    if (error) throw error;

    // 3. Group by wallet to apply Daily Cap
    const perWallet = new Map();
    for (const b of balances || []) {
      const poolId = String(b.pool_id);
      const poolMult = Number(pools[poolId] ?? 1.0);
      const pts = sqrtPoints(b.staked_amount, baseMultiplier, poolMult);

      if (!perWallet.has(b.wallet)) perWallet.set(b.wallet, { rows: [], total: 0 });
      const entry = perWallet.get(b.wallet);
      entry.rows.push({ ...b, points: pts });
      entry.total += pts;
    }

    const snapshotInserts = [];
    const ledgerInserts = [];

    // 4. Calculate Final Points & Referral Commissions
    for (const [wallet, data] of perWallet.entries()) {
      const ratio = data.total > dailyCap ? dailyCap / data.total : 1;

      // Check if this user has a referrer for the 10% bonus
      const { data: userRecord } = await sb.from("users").select("referred_by").eq("wallet", wallet).single();

      for (const r of data.rows) {
        const pointsFinal = Math.floor(r.points * ratio);
        if (pointsFinal <= 0) continue;

        // Prepare Snapshot
        snapshotInserts.push({
          snapshot_date: snapshotDate,
          wallet: r.wallet,
          pool_id: r.pool_id,
          staked_amount: r.staked_amount,
          points_awarded: pointsFinal
        });

        // Prepare Main Ledger Entry
        ledgerInserts.push({
          wallet: r.wallet,
          category: "STAKING_DAILY",
          points: pointsFinal,
          ref_id: `${snapshotDate}:${r.pool_id}`,
          meta: { pool_id: r.pool_id, snapshot_date: snapshotDate }
        });

        // ✅ REFERRAL COMMISSION (10% Lifetime Bonus)
        if (userRecord?.referred_by) {
          const commission = Math.floor(pointsFinal * 0.10);
          if (commission > 0) {
            ledgerInserts.push({
              wallet: userRecord.referred_by,
              category: "REFERRAL_COMMISSION",
              points: commission,
              ref_id: `${snapshotDate}:${r.pool_id}:${r.wallet}:bonus`,
              meta: { from_user: r.wallet, snapshot_date: snapshotDate, base_points: pointsFinal }
            });
          }
        }
      }
    }

    // 5. Bulk Upsert (Avoids duplicates and is much faster than row-by-row)
    if (snapshotInserts.length > 0) {
      await sb.from("staking_daily_snapshots").upsert(snapshotInserts, { 
        onConflict: 'snapshot_date, wallet, pool_id' 
      });
    }

    if (ledgerInserts.length > 0) {
      await sb.from("points_ledger").upsert(ledgerInserts, { 
        onConflict: 'wallet, ref_id' 
      });
    }

    return res.json({
      ok: true,
      snapshotDate,
      walletsProcessed: perWallet.size,
      awardedEntries: ledgerInserts.length
    });

  } catch (err) {
    console.error("Daily Staking Job Error:", err);
    return res.status(500).json({ error: err.message });
  }
}