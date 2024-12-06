actor MarketInteraction {
    type PlayerID = Text;
    stable var balances: Map<PlayerID, Nat] = Map.empty();

    public func buyFUDDY(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let currentBalance = Map.get(balances, playerId) ?? 0;
        balances := Map.put(balances, playerId, currentBalance + amount);
        return #ok("Purchase successful");
    };

    public func getBalance(playerId: PlayerID): async Nat {
        return Map.get(balances, playerId) ?? 0;
    };
};

