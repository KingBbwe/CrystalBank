// src/components/MacroManager/TransferFuddy.tsx
import React, { useState } from "react";
import { macroManagerActor } from "@/lib/macroManager";

const TransferFuddy = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  const handleTransfer = async () => {
    try {
      const result = await macroManagerActor.transferRealFuddy(recipient, amount);
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert("Error during transfer: " + error.message);
    }
  };

  return (
    <div>
      <h2>Transfer Real $FUDDY</h2>
      <input
        type="text"
        placeholder="Recipient Principal ID"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={handleTransfer}>Transfer</button>
    </div>
  );
};

export default TransferFuddy;
