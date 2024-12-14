import HashMap "mo:base/HashMap";

actor MarketInteraction {
    type PlayerID = Text;

    stable var balances: HashMap.HashMap<PlayerID, Nat> = HashMap.HashMap();

    public shared func buyFUDDY(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let currentBalance = balances.get(playerId).unwrapOr(0);
        balances.put(playerId, currentBalance + amount);
        return #ok("Purchase successful");
    };

    public shared func getBalance(playerId: PlayerID): async Nat {
        return balances.get(playerId).unwrapOr(0);
    };
};
