import { supabaseServer } from "../../../lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const sb = supabaseServer();

  try {
    // Fetch the 100 most recent users to display in the admin sidebar
    const { data, error } = await sb
      .from("users")
      .select("wallet, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}