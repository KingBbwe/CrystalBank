// src/components/MacroManager/BehaviorScoreAdjustment.tsx
import React, { useState } from "react";
import { macroManagerActor } from "@/lib/macroManager";

const BehaviorScoreAdjustment = () => {
  const [targetAccount, setTargetAccount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("Reward");
  const [amount, setAmount] = useState(0);

  const adjustBehaviorScore = async () => {
    try {
      const result = await macroManagerActor.adjustAccountBehaviorScore(
        targetAccount,
        adjustmentType === "Reward" ? { Reward: null } : { Penalty: null },
        amount
      );
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert("Error adjusting behavior score: " + error.message);
    }
  };

  return (
    <div>
      <h2>Adjust Behavior Score</h2>
      <input
        type="text"
        placeholder="Target Account Principal ID"
        value={targetAccount}
        onChange={(e) => setTargetAccount(e.target.value)}
      />
      <select onChange={(e) => setAdjustmentType(e.target.value)}>
        <option value="Reward">Reward</option>
        <option value="Penalty">Penalty</option>
      </select>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={adjustBehaviorScore}>Adjust</button>
    </div>
  );
};

export default BehaviorScoreAdjustment;
