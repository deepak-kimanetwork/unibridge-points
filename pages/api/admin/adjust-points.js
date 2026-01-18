import { supabaseServer } from "../../../lib/supabaseServer";

// ✅ SAME ADMIN WALLET PROTECTION
const ADMIN_WALLET = "0x3344BEEd6bED5079bf57B63a72d8823Ec402022d".toLowerCase();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { adminWallet, targetWallet, amount, reason } = req.body;

  // 1. Security Check: Ensure the requester is actually the admin
  if (!adminWallet || adminWallet.toLowerCase() !== ADMIN_WALLET) {
    return res.status(401).json({ error: "Unauthorized: Admin access only" });
  }

  if (!targetWallet || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid target wallet or amount" });
  }

  const sb = supabaseServer();
  const timestamp = Date.now();

  try {
    // 2. Insert the manual adjustment into the ledger
    const { data, error } = await sb.from("points_ledger").insert({
      wallet: targetWallet.toLowerCase(),
      category: "MANUAL_ADJUSTMENT",
      points: parseInt(amount),
      status: "verified",
      description: reason || "Admin Manual Adjustment",
      ref_id: `manual-${timestamp}`, // Unique ID to prevent duplicates
      meta: { adjusted_by: adminWallet, timestamp }
    });

    if (error) throw error;

    return res.json({ ok: true, message: `Successfully adjusted ${amount} points for ${targetWallet}` });
  } catch (err) {
    console.error("Adjustment Error:", err);
    return res.status(500).json({ error: err.message });
  }
}