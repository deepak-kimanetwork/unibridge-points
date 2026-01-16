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

  // ✅ Minimal ABI needed for staking balance
  const STAKING_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function getPricePerFullShare() view returns (uint256)"
  ];

  const staking = new ethers.Contract(contractAddress, STAKING_ABI, provider);

  // Your pools (UI lock terms)
  const pools = [30, 60, 90, 180, 360];

  // Fetch share price once (same for all users)
  const pricePerShareRaw = await staking.getPricePerFullShare();

  // NOTE:
  // Most vaults use 1e18 precision for pricePerShare
  const pricePerShare = Number(ethers.formatUnits(pricePerShareRaw, 18));

  // Load all tracked users
  const { data: users, error } = await sb.from("users").select("wallet");
  if (error) return res.status(500).json({ error: error.message });

  let updated = 0;

  for (const u of users || []) {
    // user shares
    const sharesRaw = await staking.balanceOf(u.wallet);

    // shares often are also 1e18 decimals
    const shares = Number(ethers.formatUnits(sharesRaw, 18));

    // ✅ estimated staked KIMA equivalent
    const stakedKima = shares * pricePerShare;

    // Because your UI shows 5 pools but contract has ONE balanceOf(),
    // we store the SAME balance across pools for now.
    // Later: dev team can upgrade to per-pool staking when per-pool method is confirmed.
    for (const poolId of pools) {
      await sb.from("staking_balances").upsert({
        wallet: u.wallet,
        pool_id: poolId,
        staked_amount: stakedKima,
        updated_at: new Date().toISOString()
      });

      updated++;
    }
  }

  return res.json({
    ok: true,
    usersTracked: users?.length || 0,
    pricePerShare,
    updated,
    note:
      "Using balanceOf(wallet) and getPricePerFullShare(). If contract supports per-pool balances, we can upgrade to store real per-pool values."
  });
}
