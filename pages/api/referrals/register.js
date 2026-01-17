import { supabaseServer } from "../../../lib/supabaseServer";

function norm(w) {
  return (w || "").toLowerCase();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { referrer, referred } = req.body;

    const referrerWallet = norm(referrer);
    const referredWallet = norm(referred);

    if (!referrerWallet || !referredWallet) {
      return res.status(400).json({ error: "Missing referrer/referred" });
    }

    if (referrerWallet === referredWallet) {
      return res.status(400).json({ error: "Referrer cannot be same wallet" });
    }

    const sb = supabaseServer();

    /**
     * 1) Insert referral (only first time)
     */
    const { error: refErr } = await sb
      .from("referrals")
      .insert([{ referrer_wallet: referrerWallet, referred_wallet: referredWallet }]);

    // if referred already exists -> ignore
    if (refErr && !String(refErr.message || "").includes("duplicate key")) {
      return res.status(500).json({
        error: "referrals insert failed",
        details: refErr.message,
      });
    }

    /**
     * 2) Give referred bonus ONE TIME
     */
    const referredBonus = 200;
    const bonusRefId = `REF_BONUS:${referredWallet}`;

    const { error: bonusErr } = await sb.from("points_ledger").insert([
      {
        wallet: referredWallet,
        category: "REFERRAL_BONUS_REFERRED",
        points: referredBonus,
        ref_id: bonusRefId,
        meta: { referrer: referrerWallet },
      },
    ]);

    // If duplicate ref_id exists, ignore
    if (bonusErr && !String(bonusErr.message || "").includes("duplicate key")) {
      return res.status(500).json({
        error: "bonus insert failed",
        details: bonusErr.message,
      });
    }

    /**
     * 3) Referrer commission (10% of referred earned points)
     * This should be lifetime — so we insert it whenever referral bonus triggers or daily jobs.
     * For now: give 10% commission of the +200 referral bonus.
     */
    const commissionPercent = 10;
    const commissionPoints = Math.floor((referredBonus * commissionPercent) / 100);

    if (commissionPoints > 0) {
      const commissionRefId = `REF_COMMISSION:${referredWallet}:${bonusRefId}`;

      const { error: commErr } = await sb.from("points_ledger").insert([
        {
          wallet: referrerWallet,
          category: "REFERRAL_EARN_REFERRER",
          points: commissionPoints,
          ref_id: commissionRefId,
          meta: {
            percent: commissionPercent,
            referrer_of: referredWallet, // ✅ REQUIRED for referral_commissions trigger
            source_ref_id: bonusRefId,   // ✅ optional but useful for debugging
          },
        },
      ]);

      // If duplicate, ignore
      if (commErr && !String(commErr.message || "").includes("duplicate key")) {
        return res.status(500).json({
          error: "commission insert failed",
          details: commErr.message,
        });
      }
    }

    return res.json({
      ok: true,
      referredBonus,
      commissionPoints,
    });
  } catch (e) {
    return res.status(500).json({
      error: "server error",
      details: String(e.message || e),
    });
  }
}
