import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ✅ accept both (old + new)
  const { wallet, referrer, referrerWallet } = req.body;

  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const sb = supabaseServer();

  const cleanWallet = wallet.toLowerCase();
  const cleanReferrer = (referrerWallet || referrer || "").toLowerCase() || null;

  console.log("CONNECT API BODY:", { wallet: cleanWallet, referrer: cleanReferrer });

  // ✅ upsert user
  await sb.from("users").upsert({
    wallet: cleanWallet,
    last_login_at: new Date().toISOString(),
  });

  /**
   * ✅ CONNECT BONUS (ONLY ONCE PER WALLET)
   */
  const { data: existingConnect } = await sb
    .from("points_ledger")
    .select("id")
    .eq("wallet", cleanWallet)
    .eq("category", "CONNECT")
    .limit(1);

  if (!existingConnect || existingConnect.length === 0) {
    const { data: cfgRow } = await sb
      .from("points_config")
      .select("config")
      .eq("id", 1)
      .single();

    const bonus = cfgRow?.config?.connect_bonus ?? 50;

    await sb.from("points_ledger").insert({
      wallet: cleanWallet,
      category: "CONNECT",
      points: bonus,
      ref_id: `connect_bonus:${cleanWallet}`, // ✅ unique per wallet
      meta: {},
    });
  }

  /**
   * ✅ REFERRAL SYSTEM
   * Rules:
   * - referred gets +200 once
   * - store referral link in public.referrals once
   */
  const isValidReferrer =
    cleanReferrer &&
    cleanReferrer.startsWith("0x") &&
    cleanReferrer.length === 42 &&
    cleanReferrer !== cleanWallet;

  if (isValidReferrer) {
    // ✅ Insert into public.referrals ONCE (referred_wallet must not duplicate)
    const { data: existingReferral } = await sb
      .from("referrals")
      .select("id")
      .eq("referred_wallet", cleanWallet)
      .limit(1);

    if (!existingReferral || existingReferral.length === 0) {
      await sb.from("referrals").insert({
        referred_wallet: cleanWallet,
        referrer_wallet: cleanReferrer,
      });
    }

    // ✅ +200 bonus ONCE
    const { data: existingReferralBonus } = await sb
      .from("points_ledger")
      .select("id")
      .eq("wallet", cleanWallet)
      .eq("category", "REFERRAL_BONUS_REFERRED")
      .limit(1);

    if (!existingReferralBonus || existingReferralBonus.length === 0) {
      await sb.from("points_ledger").insert({
        wallet: cleanWallet,
        category: "REFERRAL_BONUS_REFERRED",
        points: 200,
        ref_id: `ref_bonus:${cleanWallet}`, // ✅ unique per wallet
        meta: { referrer: cleanReferrer },
      });
    }
  }

  return res.json({ ok: true });
}
