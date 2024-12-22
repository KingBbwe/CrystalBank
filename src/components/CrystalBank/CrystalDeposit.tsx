// src/components/CrystalBank/CrystalDeposit.tsx
import React, { useState } from "react";
import { crystalBankActor } from "@/lib/contract";

const CrystalDeposit = () => {
  const [playerId, setPlayerId] = useState("");
  const [crystalType, setCrystalType] = useState("Type1");
  const [amount, setAmount] = useState(0);

  const depositCrystals = async () => {
    const result = await crystalBankActor.depositCrystals(playerId, crystalType, amount);
    if ("ok" in result) {
      alert(result.ok);
    } else {
      alert(result.err);
    }
  };

  return (
    <div>
      <h1>Crystal Deposit</h1>
      <input
        type="text"
        placeholder="Player ID"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
      />
      <select value={crystalType} onChange={(e) => setCrystalType(e.target.value)}>
        <option value="Type1">Type1</option>
        <option value="Type2">Type2</option>
        <option value="Type3">Type3</option>
        <option value="Type4">Type4</option>
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={depositCrystals}>Deposit</button>
    </div>
  );
};

export default CrystalDeposit;
