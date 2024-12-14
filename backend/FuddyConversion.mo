import HashMap "mo:base/HashMap";

// Placeholder for external blockchain wallet interface
actor class BlockchainWallet(canisterId: Principal) {
    public shared func deposit(playerId: Text, amount: Nat): async Result<Text, Text>;
}

actor FuddyConversion {
    type PlayerID = Text;
    type FuddyBalance = Nat;

    // Player in-game FUDDY balances
    stable var fuddyBalances: HashMap.HashMap<PlayerID, FuddyBalance> = HashMap.HashMap();

    // Reference to the external blockchain wallet
    let blockchainWallet = BlockchainWallet(Principal.fromText("<INSERT_CANISTER_ID>"));

    public shared func convertToBlockchain(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentBalance = fuddyBalances.get(playerId).unwrapOr(0);

        // Check if the player has enough in-game FUDDY
        if (amount > currentBalance) {
            return #err("Insufficient in-game FUDDY balance");
        };

        // Deduct in-game FUDDY
        fuddyBalances.put(playerId, currentBalance - amount);

        // Deposit equivalent $FUDDY to blockchain wallet
        let result = await blockchainWallet.deposit(playerId, amount);
        switch (result) {
            case (#ok(_)) return #ok("Converted to $FUDDY successfully");
            case (#err(msg)) return #err(msg);
        };
    }

    public shared func getBalance(playerId: PlayerID): async FuddyBalance {
        return fuddyBalances.get(playerId).unwrapOr(0);
    }
}
