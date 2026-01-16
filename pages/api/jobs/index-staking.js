import { supabaseServer } from "../../../lib/supabaseServer";
import { ethers } from "ethers";

function requireCronSecret(req) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET) return true;
  return secret === process.env.CRON_SECRET;
}

export default async function handler(req, res) {
  try {
    // Allow POST + GET (debugging)
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!requireCronSecret(req)) {
      return res.status(401).json({ error: "Unauthorized cron" });
    }

    const rpcUrl = process.env.ARB_RPC_URL;
    const contractAddress = process.env.STAKING_CONTRACT_ADDRESS;

    if (!rpcUrl || !contractAddress) {
      return res.status(400).json({
        error: "Missing env vars",
        hasArbRpc: !!rpcUrl,
        stakingContractAddress: contractAddress || null
      });
    }

    const sb = supabaseServer();
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // ✅ Only use users(poolId, wallet)
    const STAKING_ABI = [
      "function users(uint256,address) view returns (uint256 shares,uint256 lastDepositedTime,uint256 totalInvested,uint256 totalClaimed)"
    ];

    const staking = new ethers.Contract(contractAddress, STAKING_ABI, provider);

    // Load config from DB
    const { data: cfgRow, error: cfgErr } = await sb
      .from("points_config")
      .select("config")
      .eq("id", 1)
      .single();

    if (cfgErr) {
      return res.status(500).json({ error: "Failed to load config", details: cfgErr.message });
    }

    const cfg = cfgRow?.config || {};
    const poolMap = cfg.staking_pool_id_map || {
      "3": 30,
      "4": 60,
      "5": 90,
      "6": 180,
      "7": 360
    };

    const poolIds = Object.keys(poolMap).map((x) => Number(x));

    // Load wallets to track
    const { data: users, error: userErr } = await sb.from("users").select("wallet");
    if (userErr) {
      return res.status(500).json({ error: "Failed to load users", details: userErr.message });
    }

    let updated = 0;
    let walletsProcessed = 0;

    for (const u of users || []) {
      walletsProcessed++;

      for (const poolId of poolIds) {
        const lockTerm = poolMap[String(poolId)]; // 30/60/90/180/360

        const userData = await staking.users(poolId, u.wallet);

        // ✅ totalInvested is the real KIMA amount invested into that pool
        // Most likely 18 decimals
        const stakedKima = Number(ethers.formatUnits(userData.totalInvested, 18));

        const { error: upErr } = await sb.from("staking_balances").upsert({
          wallet: u.wallet,
          pool_id: lockTerm,
          staked_amount: stakedKima,
          updated_at: new Date().toISOString()
        });

        if (upErr) {
          return res.status(500).json({
            error: "Failed to upsert staking_balances",
            details: upErr.message,
            wallet: u.wallet,
            lockTerm
          });
        }

        updated++;
      }
    }

    return res.status(200).json({
      ok: true,
      walletsProcessed,
      usersTracked: users?.length || 0,
      updated,
      poolMap,
      note: "Indexed using users(poolId,wallet).totalInvested (no getPricePerFullShare)"
    });
  } catch (e) {
    return res.status(500).json({
      error: "index-staking crashed",
      details: e?.message || String(e)
    });
  }
}
