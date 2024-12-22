// pages/index.tsx
import React from "react";
import PlayerManager from "@/components/CrystalBank/PlayerManager";
import CrystalDeposit from "@/components/CrystalBank/CrystalDeposit";
import ConversionRates from "@/components/CrystalBank/ConversionRates";
import TransactionHistory from "@/components/CrystalBank/TransactionHistory";

const Home = () => {
  return (
    <div>
      <h1>Crystal Bank Dashboard</h1>
      <PlayerManager />
      <CrystalDeposit />
      <ConversionRates />
      <TransactionHistory />
    </div>
  );
};

export default Home;
