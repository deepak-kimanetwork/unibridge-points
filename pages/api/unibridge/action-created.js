import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const secret = req.headers["x-unibridge-secret"];
  if (secret !== process.env.UNIBRIDGE_WIDGET_SECRET) {
    return res.status(401).json({ error: "Unauthorized: Invalid secret" });
  }

  // ✅ UPDATE: Receive referralCode from the body
  const { txId, wallet, actionType, usdValue, meta, referralCode } = req.body;

  if (!txId || !wallet) {
    return res.status(400).json({ error: "txId and wallet required" });
  }

  const sb = supabaseServer();
  const walletAddr = wallet.toLowerCase();

  try {
    // 2. NEW REFERRAL LOGIC: Check if this is a new user with a referral
    const { data: existingUser } = await sb.from("users").select("referred_by").eq("wallet", walletAddr).single();
    
    let referredBy = existingUser?.referred_by || null;

    if (!existingUser && referralCode) {
      // Find the inviter by their code
      const { data: inviter } = await sb.from("users").select("wallet").eq("referral_code", referralCode).single();
      if (inviter) {
        referredBy = inviter.wallet;
      }
    }

    // 3. STORE USER
    await sb.from("users").upsert({ 
      wallet: walletAddr, 
      last_login_at: new Date().toISOString(),
      // ✅ UPDATE: Save referral data
      referred_by: referredBy,
      referral_code: walletAddr.slice(2, 10) // Generate their own code
    });

    // 4. NEW REFERRAL LOGIC: Award the 200 pts bonus if new & referred
    if (!existingUser && referredBy) {
      await sb.from("points_ledger").insert({
        wallet: walletAddr,
        category: "REFERRAL_BONUS",
        points: 200,
        description: "Welcome bonus from referral",
        status: "verified"
      });
    }

    // 5. STORE TRANSACTION (Pending status)
    await sb.from("unibridge_transactions").upsert({
      tx_id: txId,
      wallet: walletAddr,
      action_type: actionType || "unibridge",
      status: "pending",
      usd_value: usdValue || 0,
      metadata: meta || {}
    });

    // 6. REGISTER PENDING ENTRY IN LEDGER
    await sb.from("points_ledger").upsert({
      wallet: walletAddr,
      category: "UNIBRIDGE_TX",
      points: 0, 
      ref_id: txId,
      status: "pending"
    }, { onConflict: 'ref_id' });

    return res.json({ ok: true, message: "Action registered" });
  } catch (err) {
    console.error("Action Registration Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}