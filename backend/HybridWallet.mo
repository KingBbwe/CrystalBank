import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor HybridWallet {
    type PlayerID = Text;

    // Define wallet structure with var fields
    type WalletBalance = {
        var inGameFuddy: Nat;  // Amount of in-game FUDDY
        var realFuddy: Nat;    // Amount of real $FUDDY
    };

    // Define immutable wallet structure for shared functions
    type ImmutableWalletBalance = {
        inGameFuddy: Nat;
        realFuddy: Nat;
    };

    // Stable storage for serialization
    private stable var entries : [(PlayerID, WalletBalance)] = [];

    // Initialize HashMap
    private var playerWallets = HashMap.HashMap<PlayerID, WalletBalance>(10, Text.equal, Text.hash);

    // System upgrade hook - before
    system func preupgrade() {
        entries := Array.map<(PlayerID, WalletBalance), (PlayerID, WalletBalance)>(
            Iter.toArray(playerWallets.entries()),
            func((k, v)) = (k, v)
        );
    };

    // System upgrade hook - after
    system func postupgrade() {
        for ((playerId, balance) in entries.vals()) {
            playerWallets.put(playerId, balance);
        };
        entries := [];
    };

    // Helper function to create a new wallet
    private func createNewWallet() : WalletBalance {
        return {
            var inGameFuddy = 0;
            var realFuddy = 0;
        };
    };

    // Deposit real $FUDDY into the wallet
    public shared func depositRealFuddy(playerId: PlayerID, amount: Nat): async Result.Result<Text, Text> {
        let walletOpt = playerWallets.get(playerId);
        var wallet = switch (walletOpt) {
            case (null) {
                let newWallet = createNewWallet();
                playerWallets.put(playerId, newWallet);
                newWallet
            };
            case (?existing) { existing };
        };
        
        wallet.realFuddy += amount;
        return #ok("Real $FUDDY deposited successfully");
    };

    // Transfer real $FUDDY between accounts
    public shared func transferRealFuddy(from: PlayerID, to: PlayerID, amount: Nat): async Result.Result<Text, Text> {
        let senderOpt = playerWallets.get(from);
        let sender = switch (senderOpt) {
            case (null) return #err("Sender wallet not found");
            case (?wallet) wallet;
        };

        if (sender.realFuddy < amount) {
            return #err("Insufficient real $FUDDY balance");
        };

        let receiverOpt = playerWallets.get(to);
        var receiver = switch (receiverOpt) {
            case (null) {
                let newWallet = createNewWallet();
                playerWallets.put(to, newWallet);
                newWallet
            };
            case (?existing) { existing };
        };

        sender.realFuddy -= amount;
        receiver.realFuddy += amount;

        return #ok("Transfer successful");
    };

    // Convert real $FUDDY to in-game FUDDY
    public shared func convertToInGameFuddy(playerId: PlayerID, amount: Nat): async Result.Result<Text, Text> {
        let walletOpt = playerWallets.get(playerId);
        let wallet = switch (walletOpt) {
            case (null) return #err("Wallet not found");
            case (?existing) existing;
        };

        if (wallet.realFuddy < amount) {
            return #err("Insufficient real $FUDDY balance to convert to in-game FUDDY");
        };

        wallet.realFuddy -= amount;
        wallet.inGameFuddy += amount;

        return #ok("Converted to in-game FUDDY successfully");
    };

    // Spend in-game FUDDY
    public shared func spendInGameFuddy(playerId: PlayerID, amount: Nat): async Result.Result<Text, Text> {
        let walletOpt = playerWallets.get(playerId);
        let wallet = switch (walletOpt) {
            case (null) return #err("Wallet not found");
            case (?existing) existing;
        };

        if (wallet.realFuddy < amount) {
            return #err("Insufficient real $FUDDY backing for in-game spending");
        };

        if (wallet.inGameFuddy < amount) {
            return #err("Insufficient in-game FUDDY balance");
        };

        wallet.inGameFuddy -= amount;
        return #ok("In-game FUDDY spent successfully");
    };

    // Fetch wallet balances for a specific player
    public shared query func getBalances(playerId: PlayerID): async Result.Result<ImmutableWalletBalance, Text> {
        let walletOpt = playerWallets.get(playerId);
        switch (walletOpt) {
            case (null) #err("Wallet not found");
            case (?wallet) #ok({
                inGameFuddy = wallet.inGameFuddy;
                realFuddy = wallet.realFuddy;
            });
        }
    };
}
