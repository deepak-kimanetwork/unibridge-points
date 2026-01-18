import { supabaseServer } from "./supabaseServer";

export async function getProjectConfig() {
  const sb = supabaseServer();
  
  const { data, error } = await sb
    .from("points_config")
    .select("config")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Error loading project config:", error);
    // Return hardcoded defaults if DB fails
    return {
      bonuses: { wallet_connection_base: 50, referral_signup_extra: 200, referral_lifetime_commission: 0.10 },
      weighting: { unibridge_points: 0.60, staking_points: 0.40 }
    };
  }

  return data.config;
}