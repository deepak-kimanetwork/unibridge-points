export default function handler(req, res) {
  res.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasArbRpc: !!process.env.ARB_RPC_URL,
    stakingContract: process.env.STAKING_CONTRACT_ADDRESS || null,
    hasCronSecret: !!process.env.CRON_SECRET
  });
}
