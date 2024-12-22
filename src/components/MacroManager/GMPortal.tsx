// src/components/MacroManager/GMPortal.tsx
import React, { useState } from "react";
import { macroManagerActor } from "@/lib/macroManager";

const GMPortal = () => {
  const [playerId, setPlayerId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState(0);

  // Register a player
  const handleRegisterPlayer = async () => {
    try {
      const result = await macroManagerActor.registerPlayer(playerId);
      alert(result ? "Player registered successfully" : "Player registration failed");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Distribute crystals
  const handleDistributeCrystals = async () => {
    try {
      const result = await macroManagerActor.depositCrystals(playerId, "Type1", amount);
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Transfer Real $FUDDY
  const handleTransferFuddy = async () => {
    try {
      const result = await macroManagerActor.transferRealFuddy(recipientId, amount);
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Convert In-Game $FUDDY
  const handleConvertFuddy = async () => {
    try {
      const result = await macroManagerActor.convertToRealFuddy(amount);
      if ("ok" in result) {
        alert(result.ok);
      } else {
        alert(result.err);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>GM Portal</h1>

      {/* Register Player */}
      <div>
        <h2>Register Player</h2>
        <input
          type="text"
          placeholder="Player ID"
          onChange={(e) => setPlayerId(e.target.value)}
        />
        <button onClick={handleRegisterPlayer}>Register</button>
      </div>

      {/* Distribute Crystals */}
      <div>
        <h2>Distribute Crystals</h2>
        <input
          type="text"
          placeholder="Player ID"
          onChange={(e) => setPlayerId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={handleDistributeCrystals}>Distribute</button>
      </div>

      {/* Transfer Real $FUDDY */}
      <div>
        <h2>Transfer Real $FUDDY</h2>
        <input
          type="text"
          placeholder="Recipient ID"
          onChange={(e) => setRecipientId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={handleTransferFuddy}>Transfer</button>
      </div>

      {/* Convert In-Game $FUDDY */}
      <div>
        <h2>Convert In-Game $FUDDY</h2>
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button onClick={handleConvertFuddy}>Convert</button>
      </div>
    </div>
  );
};

export default GMPortal;
