import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Security: You should verify the requester is an admin wallet here
  const { newConfig } = req.body;

  if (!newConfig) return res.status(400).json({ error: "Config data missing" });

  const sb = supabaseServer();

  const { error } = await sb
    .from("points_config")
    .upsert({ id: 1, config: newConfig });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ ok: true, message: "Configuration updated successfully" });
}