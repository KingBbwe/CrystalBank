import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Iter "mo:base/Iter";

actor class MarketInteraction() {
    // Type definitions
    public type PlayerID = Text;
    public type Balance = Nat;
    public type TransactionError = {
        #InsufficientFunds;
        #InvalidAmount;
        #UserNotFound;
    };

    // Stable storage
    private stable var balanceEntries: [(PlayerID, Balance)] = [];
    private var balances = HashMap.HashMap<PlayerID, Balance>(10, Text.equal, Text.hash);

    // System upgrade hooks
    system func preupgrade() {
        balanceEntries := Iter.toArray(balances.entries());
    };

    system func postupgrade() {
        balances := HashMap.fromIter<PlayerID, Balance>(
            balanceEntries.vals(),
            10,
            Text.equal,
            Text.hash
        );
        balanceEntries := [];
    };

    // Buy FUDDY tokens
    public shared func buyFUDDY(playerId: PlayerID, amount: Nat) : async Result.Result<Text, TransactionError> {
        if (amount == 0) {
            return #err(#InvalidAmount);
        };

        let currentBalance = balances.get(playerId).unwrapOr(0);
        
        // Check for potential overflow
        try {
            let newBalance = currentBalance + amount;
            balances.put(playerId, newBalance);
            #ok("Purchase successful: " # Nat.toText(amount) # " FUDDY tokens added")
        } catch (e) {
            #err(#InvalidAmount)
        }
    };

    // Get balance for a player
    public query func getBalance(playerId: PlayerID) : async Balance {
        balances.get(playerId).unwrapOr(0)
    };

    // Transfer FUDDY between players
    public shared func transferFUDDY(
        fromPlayer: PlayerID,
        toPlayer: PlayerID,
        amount: Nat
    ) : async Result.Result<Text, TransactionError> {
        if (amount == 0) {
            return #err(#InvalidAmount);
        };

        let fromBalance = balances.get(fromPlayer).unwrapOr(0);
        if (fromBalance < amount) {
            return #err(#InsufficientFunds);
        };

        let toBalance = balances.get(toPlayer).unwrapOr(0);
        
        // Update balances
        balances.put(fromPlayer, fromBalance - amount);
        balances.put(toPlayer, toBalance + amount);
        
        #ok("Transfer successful")
    };

    // Get total supply in circulation
    public query func getTotalSupply() : async Nat {
        var total = 0;
        for (balance in balances.vals()) {
            total += balance;
        };
        total
    };
};
