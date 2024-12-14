import HashMap "mo:base/HashMap";

// Define wallet structure
type WalletBalance = { inGameFuddy: Nat; realFuddy: Nat };

actor HybridWallet {
    type PlayerID = Text;

    // Stable storage for wallet balances
    stable var playerWallets: HashMap.HashMap<PlayerID, WalletBalance> = HashMap.HashMap();

    // Deposit real $FUDDY into the wallet
    public shared func depositRealFuddy(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentWallet = playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });
        currentWallet.realFuddy += amount;
        playerWallets.put(playerId, currentWallet);
        return #ok("Real $FUDDY deposited successfully");
    }

    // Transfer $FUDDY to in-game FUDDY
    public shared func transferToInGame(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentWallet = playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });

        // Check if enough real $FUDDY exists
        if (amount > currentWallet.realFuddy) {
            return #err("Insufficient real $FUDDY balance");
        };

        // Update balances
        currentWallet.realFuddy -= amount;
        currentWallet.inGameFuddy += amount;
        playerWallets.put(playerId, currentWallet);

        return #ok("Transferred to in-game FUDDY successfully");
    }

    // Get current wallet balances
    public shared func getBalances(playerId: PlayerID): async WalletBalance {
        return playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });
    }
}
