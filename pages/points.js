import { useState } from "react";

export default function Points() {
  const [wallet, setWallet] = useState("");
  const [data, setData] = useState(null);

  async function connect() {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const w = accounts?.[0];
    setWallet(w);

    // register connect bonus (server-side)
    await fetch("/api/points/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: w })
    });

    await refresh(w);
  }

  async function refresh(w) {
    const res = await fetch(`/api/points/summary?wallet=${w}`);
    const json = await res.json();
    setData(json);
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Points Dashboard</h1>

      {!wallet ? (
        <button onClick={connect}>Connect MetaMask</button>
      ) : (
        <>
          <p><b>Wallet:</b> {wallet}</p>
          <button onClick={() => refresh(wallet)}>Refresh</button>

          {data && (
            <div style={{ marginTop: 16 }}>
              <h3>Totals</h3>
              <p><b>Total Score:</b> {data.totalScore}</p>
              <p><b>Unibridge Points:</b> {data.unibridgePoints}</p>
              <p><b>Staking Points:</b> {data.stakingPoints}</p>
              <p><b>Rank:</b> {data.rank}</p>
            </div>
          )}
        </>
      )}

      <hr style={{ margin: "24px 0" }} />

      <p>
        Leaderboard: <a href="/leaderboard">/leaderboard</a>
      </p>
    </div>
  );
}
