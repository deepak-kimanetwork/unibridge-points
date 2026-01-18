import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  // 1. Security check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sb = supabaseServer();
  
  // 2. Fetch pending actions
  // We use 'unibridge_transactions' to match our updated schema
  const { data: pendingTxs } = await sb
    .from("unibridge_transactions")
    .select("*")
    .eq("status", "pending")
    .limit(20);

  if (!pendingTxs || pendingTxs.length === 0) {
    return res.json({ processed: 0, message: "No pending transactions" });
  }

  let verifiedCount = 0;

  for (const tx of pendingTxs) {
    try {
      // 3. Query Kima Explorer / Backend
      // Replace with the actual URL the dev team provides
      const kimaStatusUrl = `https://api.kima.network/v1/tx/${tx.tx_id}`;
      const response = await fetch(kimaStatusUrl);
      const kimaData = await response.json();

      // Check if the transaction is officially successful
      if (kimaData.status === "success") {
        const pointsToAward = (tx.usd_value || 0) * 10;

        // 4. Update the Transaction Record
        await sb.from("unibridge_transactions")
          .update({ status: "verified" })
          .eq("tx_id", tx.tx_id);

        // 5. Finalize the Ledger Entry
        // We update the existing 'pending' ledger entry we made in action-created.js
        await sb.from("points_ledger")
          .update({ 
            points: pointsToAward, 
            status: "verified",
            description: `Bridge Reward: ${tx.action_type}`
          })
          .eq("ref_id", tx.tx_id);

        verifiedCount++;
      } else if (kimaData.status === "failed") {
        // Mark as failed - user gets 0 points
        await sb.from("unibridge_transactions").update({ status: "failed" }).eq("tx_id", tx.tx_id);
        await sb.from("points_ledger").update({ status: "failed" }).eq("ref_id", tx.tx_id);
      }
    } catch (err) {
      console.error(`Verification error for ${tx.tx_id}:`, err);
    }
  }

  return res.json({ processed: pendingTxs.length, verified: verifiedCount });
}