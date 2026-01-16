import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/points/leaderboard?limit=50")
      .then((r) => r.json())
      .then((j) => setRows(j.rows || []));
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Leaderboard</h1>
      <ol>
        {rows.map((r) => (
          <li key={r.wallet}>
            {r.walletShort} — <b>{r.totalScore}</b> (U:{r.unibridgePoints}, S:{r.stakingPoints})
          </li>
        ))}
      </ol>
    </div>
  );
}
