// src/components/CrystalBank/TransactionHistory.tsx
import React, { useState, useEffect } from "react";
import { crystalBankActor } from "@/lib/contract";

const TransactionHistory = () => {
  const [playerId, setPlayerId] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const result = playerId
      ? await crystalBankActor.getPlayerTransactions(playerId)
      : await crystalBankActor.getTransactionHistory();
    setHistory(result);
  };

  useEffect(() => {
    fetchHistory();
  }, [playerId]);

  return (
    <div>
      <h2>Transaction History</h2>
      <input
        type="text"
        placeholder="Player ID (leave blank for all)"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
      />
      <button onClick={fetchHistory}>Fetch</button>
      <ul>
        {history.map((record, index) => (
          <li key={index}>
            {record.action} - Amount: {record.amount} - Time: {new Date(record.timestamp / 1e6).toLocaleString()} - Player: {record.playerId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
