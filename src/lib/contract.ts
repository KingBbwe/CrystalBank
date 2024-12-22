// src/lib/contract.ts
import { Actor, HttpAgent } from "@dfinity/agent";

const CANISTER_ID = "<YOUR_CANISTER_ID>";

const IDL = ({ IDL }) => IDL.Service({
  registerPlayer: IDL.Func([IDL.Text], [IDL.Bool], []),
  isPlayerRegistered: IDL.Func([IDL.Text], [IDL.Bool], []),
  removePlayer: IDL.Func([IDL.Text], [IDL.Bool], []),
  depositCrystals: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
  convertCrystalsToFUDDY: IDL.Func([IDL.Text], [IDL.Variant({ ok: IDL.Nat, err: IDL.Text })], []),
  transferFUDDY: IDL.Func([IDL.Text, IDL.Text, IDL.Nat], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
  getBalance: IDL.Func([IDL.Text], [IDL.Nat], ["query"]),
  buyFUDDY: IDL.Func([IDL.Text, IDL.Nat], [IDL.Variant({ ok: IDL.Text, err: IDL.Text })], []),
  getTransactionHistory: IDL.Func([], [IDL.Vec(IDL.Record({
    action: IDL.Text,
    amount: IDL.Nat,
    timestamp: IDL.Int,
    playerId: IDL.Text,
  }))], ["query"]),
  getPlayerTransactions: IDL.Func([IDL.Text], [IDL.Vec(IDL.Record({
    action: IDL.Text,
    amount: IDL.Nat,
    timestamp: IDL.Int,
    playerId: IDL.Text,
  }))], ["query"]),
  updateConversionRate: IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
  getCurrentConversionRates: IDL.Func([], [IDL.Opt(IDL.Record({
    Type1: IDL.Nat,
    Type2: IDL.Nat,
    Type3: IDL.Nat,
    Type4: IDL.Nat,
  }))], ["query"]),
});

const agent = new HttpAgent({ host: "http://localhost:8000" }); // Update for IC network
export const crystalBankActor = Actor.createActor(IDL, { agent, canisterId: CANISTER_ID });
