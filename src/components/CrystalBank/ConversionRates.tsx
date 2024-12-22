// src/components/CrystalBank/ConversionRates.tsx
import React, { useState, useEffect } from "react";
import { crystalBankActor } from "@/lib/contract";

const ConversionRates = () => {
  const [rates, setRates] = useState<{ Type1: number; Type2: number; Type3: number; Type4: number } | null>(null);
  const [updateRate, setUpdateRate] = useState({ type: "Type1", rate: 0 });

  const fetchRates = async () => {
    const result = await crystalBankActor.getCurrentConversionRates();
    if (result) setRates(result);
  };

  const handleUpdateRate = async () => {
    const success = await crystalBankActor.updateConversionRate(updateRate.type, updateRate.rate);
    if (success) {
      alert("Conversion rate updated successfully!");
      fetchRates();
    } else {
      alert("Failed to update conversion rate.");
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div>
      <h2>Conversion Rates</h2>
      {rates ? (
        <ul>
          {Object.entries(rates).map(([type, rate]) => (
            <li key={type}>{type}: {rate}</li>
          ))}
        </ul>
      ) : (
        <p>Loading rates...</p>
      )}
      <h3>Update Conversion Rate</h3>
      <select onChange={(e) => setUpdateRate({ ...updateRate, type: e.target.value })}>
        <option value="Type1">Type1</option>
        <option value="Type2">Type2</option>
        <option value="Type3">Type3</option>
        <option value="Type4">Type4</option>
      </select>
      <input
        type="number"
        placeholder="New Rate"
        onChange={(e) => setUpdateRate({ ...updateRate, rate: Number(e.target.value) })}
      />
      <button onClick={handleUpdateRate}>Update</button>
    </div>
  );
};

export default ConversionRates;
