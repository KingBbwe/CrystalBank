// src/components/CrystalBank/PlayerManager.tsx
import React, { useState } from "react";
import { crystalBankActor } from "@/lib/contract";

const PlayerManager = () => {
  const [playerId, setPlayerId] = useState("");
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const registerPlayer = async () => {
    const result = await crystalBankActor.registerPlayer(playerId);
    setIsRegistered(result);
    alert(result ? "Player registered!" : "Player already registered.");
  };

  const checkRegistration = async () => {
    const result = await crystalBankActor.isPlayerRegistered(playerId);
    setIsRegistered(result);
  };

  return (
    <div>
      <h1>Player Manager</h1>
      <input
        type="text"
        placeholder="Player ID"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
      />
      <button onClick={registerPlayer}>Register</button>
      <button onClick={checkRegistration}>Check Registration</button>
      {isRegistered !== null && (
        <p>{isRegistered ? "Player is registered." : "Player is not registered."}</p>
      )}
    </div>
  );
};

export default PlayerManager;
