import { supabaseServer } from "../../../lib/supabaseServer";
import { ethers } from "ethers";

function requireCronSecret(req) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET) return true;
  return secret === process.env.CRON_SECRET;
}

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

  // ✅ ABI confirmed from Arbiscan Read Contract
  const STAKING_ABI = [
    "function users(uint256,address) view returns (uint256 shares,uint256 lastDepositedTime,uint256 totalInvested,uint256 totalClaimed)",
    "function getPricePerFullShare() view returns (uint256)"
  ];

  const staking = new ethers.Contract(contractAddress, STAKING_ABI, provider);

  // Load config from DB
  const { data: cfgRow } = await sb.from("points_config").select("config").eq("id", 1).single();
  const cfg = cfgRow?.config || {};

  const poolMap = cfg.staking_pool_id_map || {
    "3": 30,
    "4": 60,
    "5": 90,
    "6": 180,
    "7": 360
  };

  const poolIds = Object.keys(poolMap).map((x) => Number(x));

  // Price per full share
  const pricePerShareRaw = await staking.getPricePerFullShare();
  const pricePerShare = Number(ethers.formatUnits(pricePerShareRaw, 18));

  // Track wallets known to the system
  const { data: users, error } = await sb.from("users").select("wallet");
  if (error) return res.status(500).json({ error: error.message });

  let updated = 0;
  let walletsProcessed = 0;

  for (const u of users || []) {
    walletsProcessed++;

    for (const poolId of poolIds) {
      const lockTerm = poolMap[String(poolId)]; // 30/60/90/180/360

      const userData = await staking.users(poolId, u.wallet);

      const shares = Number(ethers.formatUnits(userData.shares, 18));
      const stakedKima = shares * pricePerShare;

      // Store by lock-term pool_id in DB
      await sb.from("staking_balances").upsert({
        wallet: u.wallet,
        pool_id: lockTerm,
        staked_amount: stakedKima,
        updated_at: new Date().toISOString()
      });

      updated++;
    }
  }

  return res.json({
    ok: true,
    walletsProcessed,
    updated,
    pricePerShare,
    poolMap,
    note: "Indexed real pool balances via users(poolId,wallet).shares"
  });
}
