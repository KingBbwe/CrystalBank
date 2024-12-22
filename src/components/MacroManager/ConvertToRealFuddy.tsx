// src/components/MacroManager/ConvertToRealFuddy.tsx
import React, { useState } from "react";
import { macroManagerActor } from "@/lib/macroManager";

const ConvertToRealFuddy = () => {
  const [amount, setAmount] = useState(0);

  const handleConversion = async () => {
    try {
      const result = await macroManagerActor.convertToRealFuddy(amount);
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert("Error during conversion: " + error.message);
    }
  };

  return (
    <div>
      <h2>Convert In-Game $FUDDY to Real $FUDDY</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={handleConversion}>Convert</button>
    </div>
  );
};

export default ConvertToRealFuddy;
