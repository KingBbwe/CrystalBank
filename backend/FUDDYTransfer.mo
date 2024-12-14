import HashMap "mo:base/HashMap";

actor FUDDYTransfer {
    type PlayerID = Text;

    stable var balances: HashMap.HashMap<PlayerID, Nat> = HashMap.HashMap();
    stable var centralAccountBalance: Nat = 1_000_000; // Initial reserve for central operations

    public shared func depositToAccount(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let currentBalance = balances.get(playerId).unwrapOr(0);
        balances.put(playerId, currentBalance + amount);
        return #ok("Deposit successful");
    };

    public shared func withdrawFromAccount(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentBalance = balances.get(playerId).unwrapOr(0);
        if (amount > currentBalance) {
            return #err("Insufficient funds");
        };
        balances.put(playerId, currentBalance - amount);
        return #ok("Withdrawal successful");
    };

    public shared func transferFunds(fromPlayerId: PlayerID, toPlayerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let senderBalance = balances.get(fromPlayerId).unwrapOr(0);
        if (amount > senderBalance) {
            return #err("Insufficient funds");
        };
        let receiverBalance = balances.get(toPlayerId).unwrapOr(0);
        balances.put(fromPlayerId, senderBalance - amount);
        balances.put(toPlayerId, receiverBalance + amount);
        return #ok("Transfer successful");
    };

    public shared func getBalance(playerId: PlayerID): async Nat {
        return balances.get(playerId).unwrapOr(0);
    };

    public shared func getCentralAccountBalance(): async Nat {
        return centralAccountBalance;
    };
};
