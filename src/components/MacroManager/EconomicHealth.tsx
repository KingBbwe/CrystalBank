// src/components/MacroManager/EconomicHealth.tsx
import React, { useEffect, useState } from "react";
import { macroManagerActor } from "@/lib/macroManager";

const EconomicHealth = () => {
  const [health, setHealth] = useState(null);

  const fetchHealthIndicators = async () => {
    try {
      const result = await macroManagerActor.getEconomicHealthIndicators();
      setHealth(result);
    } catch (error) {
      alert("Error fetching economic health: " + error.message);
    }
  };

  useEffect(() => {
    fetchHealthIndicators();
  }, []);

  return (
    <div>
      <h2>Economic Health Indicators</h2>
      {health ? (
        <ul>
          <li>Total Real $FUDDY: {health.totalRealFuddy}</li>
          <li>Total In-Game $FUDDY: {health.totalInGameFuddy}</li>
          <li>System Reserve: {health.systemReserve}</li>
          <li>Average Behavior Score: {health.averageBehaviorScore.toFixed(2)}</li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EconomicHealth;
