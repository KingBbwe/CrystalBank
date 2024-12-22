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

import React from "react";
import TransferFuddy from "@/components/MacroManager/TransferFuddy";
import ConvertToRealFuddy from "@/components/MacroManager/ConvertToRealFuddy";
import EconomicHealth from "@/components/MacroManager/EconomicHealth";
import BehaviorScoreAdjustment from "@/components/MacroManager/BehaviorScoreAdjustment";

const Home = () => {
  return (
    <div>
      <h1>Crystal Bank Macro Dashboard</h1>
      <TransferFuddy />
      <ConvertToRealFuddy />
      <EconomicHealth />
      <BehaviorScoreAdjustment />
    </div>
  );
};

export default Home;
