import { supabaseServer } from "../../../lib/supabaseServer";
import { ethers } from "ethers";

function requireCronSecret(req) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET) return true;
  return secret === process.env.CRON_SECRET;
}

/**
 * NOTE:
 * We do NOT have the exact ABI/methods of your staking contract yet.
 * So this job is built as a "framework" that your dev team can complete
 * by plugging the correct contract read function(s).
 *
 * It already:
 * - reads all users from DB
 * - loops through pools: 30/60/90/180/360
 * - writes staking_balances rows
 */
export default async function handler(req, res) {
  if (!requireCronSecret(req)) {
    return res.status(401).json({ error: "Unauthorized cron" });
  }

  const rpcUrl = process.env.ARB_RPC_URL;
  const contractAddress = process.env.STAKING_CONTRACT_ADDRESS;

  if (!rpcUrl || !contractAddress) {
    return res.status(400).json({ error: "Missing ARB_RPC_URL or STAKING_CONTRACT_ADDRESS" });
  }

  const sb = supabaseServer();
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Minimal placeholder ABI (dev must replace with correct ABI)
  // Example methods could be: userInfo(poolId, wallet), balanceOf(wallet), deposits(wallet, poolId), etc.
  const STAKING_ABI = [
    // Replace this with real staking ABI functions
  ];

  const staking = new ethers.Contract(contractAddress, STAKING_ABI, provider);

  // Pools defined by your UI
  const pools = [30, 60, 90, 180, 360];

  // Load users we should track
  const { data: users, error } = await sb.from("users").select("wallet");
  if (error) return res.status(500).json({ error: error.message });

  let updated = 0;
  let walletsProcessed = 0;

  for (const u of users || []) {
    walletsProcessed++;

    for (const poolId of pools) {
      // ============================
      // TODO: Replace with real read
      // ============================
      // Example patterns (depends on staking contract):
      // const info = await staking.userInfo(poolId, u.wallet);
      // const staked = Number(ethers.formatUnits(info.amount, 18));
      //
      // For now: set to 0 so the system runs without breaking.
      const staked = 0;

      // Upsert staking balance
      await sb.from("staking_balances").upsert({
        wallet: u.wallet,
        pool_id: poolId,
        staked_amount: staked,
        updated_at: new Date().toISOString()
      });

      updated++;
    }
  }

  return res.json({ ok: true, walletsProcessed, updated, note: "ABI read is placeholder until staking ABI is added." });
}
