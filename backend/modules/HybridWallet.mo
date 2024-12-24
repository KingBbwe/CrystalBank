import HashMap "mo:base/HashMap";

actor HybridWallet {
    type PlayerID = Text;

    // Define wallet structure
    type WalletBalance = {
        inGameFuddy: Nat;  // Amount of in-game FUDDY
        realFuddy: Nat;    // Amount of real $FUDDY
    };

    // Stable storage for player wallets
    stable var playerWallets: HashMap.HashMap<PlayerID, WalletBalance> = HashMap.HashMap();

    // Deposit real $FUDDY into the wallet
    public shared func depositRealFuddy(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentWallet = playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });
        currentWallet.realFuddy += amount;
        playerWallets.put(playerId, currentWallet);
        return #ok("Real $FUDDY deposited successfully");
    };

    // Transfer real $FUDDY between accounts (Player-to-Player or GM)
    public shared func transferRealFuddy(from: PlayerID, to: PlayerID, amount: Nat): async Result<Text, Text> {
        let senderWallet = playerWallets.get(from).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });

        // Check if sender has enough real $FUDDY
        if (amount > senderWallet.realFuddy) {
            return #err("Insufficient real $FUDDY balance");
        };

        let receiverWallet = playerWallets.get(to).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });

        // Update balances
        senderWallet.realFuddy -= amount;
        receiverWallet.realFuddy += amount;

        playerWallets.put(from, senderWallet);
        playerWallets.put(to, receiverWallet);

        return #ok("Transfer successful");
    };

    // Convert real $FUDDY to in-game FUDDY
    public shared func convertToInGameFuddy(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentWallet = playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });

        // Check if the player has enough real $FUDDY to back the conversion
        if (amount > currentWallet.realFuddy) {
            return #err("Insufficient real $FUDDY balance to convert to in-game FUDDY");
        };

        // Update balances
        currentWallet.realFuddy -= amount;
        currentWallet.inGameFuddy += amount;
        playerWallets.put(playerId, currentWallet);

        return #ok("Converted to in-game FUDDY successfully");
    };

    // Spend in-game FUDDY, enforcing redundancy mechanism (must have real $FUDDY backing)
    public shared func spendInGameFuddy(playerId: PlayerID, amount: Nat): async Result<Text, Text> {
        let currentWallet = playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });

        // Ensure spending is backed by real $FUDDY
        if (amount > currentWallet.realFuddy) {
            return #err("Insufficient real $FUDDY backing for in-game spending");
        };

        if (amount > currentWallet.inGameFuddy) {
            return #err("Insufficient in-game FUDDY balance");
        };

        // Deduct in-game FUDDY
        currentWallet.inGameFuddy -= amount;
        playerWallets.put(playerId, currentWallet);

        return #ok("In-game FUDDY spent successfully");
    };

    // Fetch wallet balances for a specific player
    public shared func getBalances(playerId: PlayerID): async WalletBalance {
        return playerWallets.get(playerId).unwrapOr({ inGameFuddy = 0; realFuddy = 0 });
    };
}
