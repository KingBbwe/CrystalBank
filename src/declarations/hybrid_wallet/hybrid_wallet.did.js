export const idlFactory = ({ IDL }) => {
  const PlayerID = IDL.Text;
  const Result = IDL.Variant({ 'ok': IDL.Text, 'err': IDL.Text });
  const WalletBalance = IDL.Record({
    'inGameFuddy': IDL.Nat,
    'realFuddy': IDL.Nat,
  });
  const Result_1 = IDL.Variant({ 'ok': WalletBalance, 'err': IDL.Text });
  
  return IDL.Service({
    'convertToInGameFuddy': IDL.Func(
      [PlayerID, IDL.Nat],
      [Result],
      [],
    ),
    'depositRealFuddy': IDL.Func(
      [PlayerID, IDL.Nat],
      [Result],
      [],
    ),
    'getBalances': IDL.Func(
      [PlayerID],
      [Result_1],
      ['query'],
    ),
    'spendInGameFuddy': IDL.Func(
      [PlayerID, IDL.Nat],
      [Result],
      [],
    ),
    'transferRealFuddy': IDL.Func(
      [PlayerID, PlayerID, IDL.Nat],
      [Result],
      [],
    ),
  });
};

export const init = ({ IDL }) => {
  return [];
};

// Additional type definitions for TypeScript support
export const HybridWalletService = {
  convertToInGameFuddy: (playerId: string, amount: bigint) => Promise<{
    'ok'?: string;
    'err'?: string;
  }>,
  depositRealFuddy: (playerId: string, amount: bigint) => Promise<{
    'ok'?: string;
    'err'?: string;
  }>,
  getBalances: (playerId: string) => Promise<{
    'ok'?: {
      inGameFuddy: bigint;
      realFuddy: bigint;
    };
    'err'?: string;
  }>,
  spendInGameFuddy: (playerId: string, amount: bigint) => Promise<{
    'ok'?: string;
    'err'?: string;
  }>,
  transferRealFuddy: (fromPlayerId: string, toPlayerId: string, amount: bigint) => Promise<{
    'ok'?: string;
    'err'?: string;
  }>,
};
