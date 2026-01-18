import { supabaseServer } from "../../../lib/supabaseServer";

// ✅ SAME ADMIN WALLET PROTECTION
const ADMIN_WALLET = "0x3344BEEd6bED5079bf57B63a72d8823Ec402022d".toLowerCase();

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { adminWallet } = req.query;

  // Security Check
  if (!adminWallet || adminWallet.toLowerCase() !== ADMIN_WALLET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sb = supabaseServer();

  try {
    // 1. Fetch all unique wallets and their points totals from the ledger
    // We also join with the users table to get referral info
    const { data: records, error } = await sb
      .from("points_ledger")
      .select(`
        wallet,
        points,
        users!inner(referred_by, created_at)
      `);

    if (error) throw error;

    // 2. Aggregate Data by Wallet
    const exportMap = {};
    records.forEach((row) => {
      if (!exportMap[row.wallet]) {
        exportMap[row.wallet] = {
          wallet: row.wallet,
          total_points: 0,
          signup_date: row.users.created_at.split('T')[0],
          referred_by: row.users.referred_by || "Direct"
        };
      }
      exportMap[row.wallet].total_points += row.points;
    });

    // 3. Convert to CSV Format
    const csvRows = [
      ["Wallet Address", "Total Points", "Signup Date", "Referred By"].join(",")
    ];

    Object.values(exportMap)
      .sort((a, b) => b.total_points - a.total_points) // Rank by points
      .forEach((user) => {
        csvRows.push([
          user.wallet,
          user.total_points,
          user.signup_date,
          user.referred_by
        ].join(","));
      });

    const csvString = csvRows.join("\n");

    // 4. Set headers to trigger a browser download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=unibridge_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    return res.status(200).send(csvString);

  } catch (err) {
    console.error("Export Error:", err);
    return res.status(500).json({ error: "Failed to generate export" });
  }
}