import { supabaseServer } from "../../../lib/supabaseServer";

function startOfDayUTC(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfDayUTC(date) {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export default async function handler(req, res) {
  try {
    // ✅ Protect this endpoint
    const secret = req.headers["x-cron-secret"];
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const sb = supabaseServer();

    // ✅ Which day to process? Default = yesterday (UTC)
    const now = new Date();
    const target = new Date(now);
    target.setUTCDate(target.getUTCDate() - 1);

    const start = startOfDayUTC(target).toISOString();
    const end = endOfDayUTC(target).toISOString();

    const dateKey = start.slice(0, 10); // "YYYY-MM-DD"

    // ✅ referral commission percent
    const percent = 10;

    // ✅ 1) Load all referrals
    const { data: referralRows, error: refErr } = await sb
      .from("referrals")
      .select("referred_wallet, referrer_wallet");

    if (refErr) {
      return res.status(500).json({ error: "Failed to load referrals", details: refErr.message });
    }

    let processed = 0;
    let inserted = 0;

    for (const r of referralRows || []) {
      const referred = (r.referred_wallet || "").toLowerCase();
      const referrer = (r.referrer_wallet || "").toLowerCase();
      if (!referred || !referrer) continue;

      processed++;

      /**
       * ✅ 2) Fetch points earned today by referred user (only real categories)
       */
      const { data: earnedRows, error: earnedErr } = await sb
        .from("points_ledger")
        .select("points, category")
        .eq("wallet", referred)
        .in("category", ["UNIBRIDGE_TX", "STAKING_DAILY"])
        .gte("created_at", start)
        .lte("created_at", end);

      if (earnedErr) {
        console.error("EARN FETCH ERROR:", referred, earnedErr.message);
        continue;
      }

      const earnedToday = (earnedRows || []).reduce((sum, row) => {
        return sum + Number(row.points || 0);
      }, 0);

      if (earnedToday <= 0) continue;

      const commissionPoints = Math.floor((earnedToday * percent) / 100);
      if (commissionPoints <= 0) continue;

      /**
       * ✅ 3) Insert commission row (unique per referred wallet per day)
       */
      const uniqueRefId = `ref_commission_daily:${referred}:${dateKey}`;

      const { error: insertErr } = await sb.from("points_ledger").insert({
        wallet: referrer,
        category: "REFERRAL_EARN_REFERRER",
        points: commissionPoints,
        ref_id: uniqueRefId,
        meta: {
          percent,
          earned_today: earnedToday,
          referrer_of: referred, // ✅ trigger expects this
          date: dateKey,
        },
      });

      // ✅ If duplicate (already ran), ignore
      if (insertErr) {
        const msg = String(insertErr.message || "");
        if (msg.includes("duplicate")) continue;

        console.error("COMMISSION INSERT ERROR:", insertErr.message);
        continue;
      }

      inserted++;
    }

    return res.json({
      ok: true,
      date: dateKey,
      start,
      end,
      processed,
      inserted,
    });
  } catch (e) {
    return res.status(500).json({ error: "server error", details: String(e.message || e) });
  }
}
