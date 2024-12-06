actor FUDDYTransfer {
    type PlayerID = Text;
    stable var balances: Map<PlayerID, Nat] = Map.empty();
    stable var centralAccountBalance: Nat = 1000000; // Initial reserve for central operations

    public func depositToAccount(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let currentBalance = Map.get(balances, playerId) ?? 0;
        balances := Map.put(balances, playerId, currentBalance + amount);
        return #ok("Deposit successful");
    };

    public func withdrawFromAccount(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentBalance = Map.get(balances, playerId) ?? 0;
        if (amount > currentBalance) {
            return #err("Insufficient funds");
        };
        balances := Map.put(balances, playerId, currentBalance - amount);
        return #ok("Withdrawal successful");
    };

    public func transferFunds(fromPlayerId: PlayerID, toPlayerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let senderBalance = Map.get(balances, fromPlayerId) ?? 0;
        if (amount > senderBalance) {
            return #err("Insufficient funds");
        };
        let receiverBalance = Map.get(balances, toPlayerId) ?? 0;
        balances := Map.put(balances, fromPlayerId, senderBalance - amount);
        balances := Map.put(balances, toPlayerId, receiverBalance + amount);
        return #ok("Transfer successful");
    };

    public func getBalance(playerId: PlayerID): async Nat {
        return Map.get(balances, playerId) ?? 0;
    };
};

