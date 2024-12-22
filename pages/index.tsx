// pages/index.tsx
import React from "react";
import GMPortal from "@/components/MacroManager/GMPortal";
import TransferFuddy from "@/components/MacroManager/TransferFuddy";
import ConvertToRealFuddy from "@/components/MacroManager/ConvertToRealFuddy";
import EconomicHealth from "@/components/MacroManager/EconomicHealth";
import BehaviorScoreAdjustment from "@/components/MacroManager/BehaviorScoreAdjustment";
import PlayerManager from "@/components/CrystalBank/PlayerManager";
import CrystalDeposit from "@/components/CrystalBank/CrystalDeposit";
import TransactionHistory from "@/components/CrystalBank/TransactionHistory";
import ConversionRates from "@/components/CrystalBank/ConversionRates";

const Home = () => {
  return (
    <div>
      <h1>Crystal Bank Dashboard</h1>
      
      {/* CrystalBank Components */}
      <section>
        <h2>Crystal Bank Operations</h2>
        <PlayerManager />
        <CrystalDeposit />
        <TransactionHistory />
        <ConversionRates />
      </section>

      {/* MacroManager Components */}
      <section>
        <h2>Macro Management</h2>
        <TransferFuddy />
        <ConvertToRealFuddy />
        <EconomicHealth />
        <BehaviorScoreAdjustment />
      </section>

      {/* GM Portal */}
      <section>
        <h2>Game Master Portal</h2>
        <GMPortal />
      </section>
    </div>
  );
};

export default Home;
