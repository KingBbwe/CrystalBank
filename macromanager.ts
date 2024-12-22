// src/lib/macroManager.ts
import { Actor, HttpAgent } from "@dfinity/agent";

const MACRO_MANAGER_CANISTER_ID = "<YOUR_MACRO_MANAGER_CANISTER_ID>";

const IDL = ({ IDL }) => IDL.Service({
  transferRealFuddy: IDL.Func([IDL.Principal, IDL.Nat], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
  convertToRealFuddy: IDL.Func([IDL.Nat], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
  getEconomicHealthIndicators: IDL.Func([], [IDL.Record({
    totalRealFuddy: IDL.Nat,
    totalInGameFuddy: IDL.Nat,
    systemReserve: IDL.Nat,
    averageBehaviorScore: IDL.Float,
  })], ["query"]),
  adjustAccountBehaviorScore: IDL.Func(
    [IDL.Principal, IDL.Variant({ Reward: IDL.Null, Penalty: IDL.Null }), IDL.Float],
    [IDL.Variant({ ok: IDL.Text, err: IDL.Text })],
    []
  ),
});

const agent = new HttpAgent({ host: "http://localhost:8000" }); // Update for IC network
export const macroManagerActor = Actor.createActor(IDL, { agent, canisterId: MACRO_MANAGER_CANISTER_ID });
