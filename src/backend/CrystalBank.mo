import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Array "mo:base/Array";

actor CrystalBank {
    // Types
    type PlayerID = Text;
    
    type CrystalType = { 
        Type1 : Nat; 
        Type2 : Nat; 
        Type3 : Nat; 
        Type4 : Nat 
    };
    
    type TransactionRecord = { 
        action : Text; 
        amount : Nat; 
        timestamp : Int;
        playerId : Text 
    };

    // State variables
    let playerRegistry = HashMap.HashMap<PlayerID, Bool>(10, Text.equal, Text.hash);
    let depositRecords = HashMap.HashMap<PlayerID, CrystalType>(10, Text.equal, Text.hash);
    let balances = HashMap.HashMap<PlayerID, Nat>(10, Text.equal, Text.hash);
    
    var transactionHistory : [TransactionRecord] = [];

    // Conversion rates (can be dynamically updated)
    var conversionRates = { 
        Type1 = 1; 
        Type2 = 5; 
        Type3 = 10; 
        Type4 = 20 
    };

    // Private helper function to log transactions
    private func _logTransaction(playerId : PlayerID, action : Text, amount : Nat) : () {
        let record : TransactionRecord = {
            action = action;
            amount = amount;
            timestamp = Time.now();
            playerId = playerId;
        };

        transactionHistory := Array.append(transactionHistory, [record]);
    };

    // Player Registration Methods
    public func registerPlayer(playerId : PlayerID) : async Bool {
        switch (playerRegistry.get(playerId)) {
            case (?_) { false }; // Player already registered
            case (null) { 
                playerRegistry.put(playerId, true);
                true 
            };
        }
    };

    public func isPlayerRegistered(playerId : PlayerID) : async Bool {
        switch (playerRegistry.get(playerId)) {
            case (null) { false };
            case (_) { true };
        }
    };

    public func removePlayer(playerId : PlayerID) : async Bool {
        switch (playerRegistry.get(playerId)) {
            case (null) { false };
            case (_) {
                playerRegistry.delete(playerId);
                depositRecords.delete(playerId);
                balances.delete(playerId);
                true
            };
        }
    };

    // Crystal Deposit Method
    public func depositCrystals(playerId : PlayerID, crystalType : Text, amount : Nat) : async Result.Result<Text, Text> {
        // Player registration check
        switch (playerRegistry.get(playerId)) {
            case (null) { 
                return #err("Player not registered") 
            };
            case (_) {
                // Amount validation
                if (amount <= 0) {
                    return #err("Amount must be positive");
                };

                // Get or initialize deposits
                let currentDeposits = switch (depositRecords.get(playerId)) {
                    case (null) { 
                        { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 } 
                    };
                    case (?deposits) { deposits };
                };

                // Update deposits based on crystal type
                let updatedDeposits = switch (crystalType) {
                    case ("Type1") { 
                        { 
                            Type1 = currentDeposits.Type1 + amount; 
                            Type2 = currentDeposits.Type2; 
                            Type3 = currentDeposits.Type3; 
                            Type4 = currentDeposits.Type4 
                        } 
                    };
                    case ("Type2") { 
                        { 
                            Type1 = currentDeposits.Type1; 
                            Type2 = currentDeposits.Type2 + amount; 
                            Type3 = currentDeposits.Type3; 
                            Type4 = currentDeposits.Type4 
                        } 
                    };
                    case ("Type3") { 
                        { 
                            Type1 = currentDeposits.Type1; 
                            Type2 = currentDeposits.Type2; 
                            Type3 = currentDeposits.Type3 + amount; 
                            Type4 = currentDeposits.Type4 
                        } 
                    };
                    case ("Type4") { 
                        { 
                            Type1 = currentDeposits.Type1; 
                            Type2 = currentDeposits.Type2; 
                            Type3 = currentDeposits.Type3; 
                            Type4 = currentDeposits.Type4 + amount 
                        } 
                    };
                    case (_) { 
                        return #err("Invalid crystal type") 
                    };
                };

                // Update deposit records
                depositRecords.put(playerId, updatedDeposits);

                // Log transaction
                _logTransaction(playerId, "Crystal Deposit: " # crystalType, amount);

                return #ok("Deposit successful");
            }
        }
    };

    // Convert Crystals to FUDDY
    public func convertCrystalsToFUDDY(playerId : PlayerID) : async Result.Result<Nat, Text> {
        // Player registration check
        switch (playerRegistry.get(playerId)) {
            case (null) { 
                return #err("Player not registered") 
            };
            case (_) {
                // Get current deposits
                let deposits = switch (depositRecords.get(playerId)) {
                    case (null) { 
                        { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 } 
                    };
                    case (?deps) { deps };
                };

                // Calculate total FUDDY based on conversion rates
                let totalFUDDY =
                    (deposits.Type1 * conversionRates.Type1) +
                    (deposits.Type2 * conversionRates.Type2) +
                    (deposits.Type3 * conversionRates.Type3) +
                    (deposits.Type4 * conversionRates.Type4);

                // Update player balance
                let currentBalance = switch (balances.get(playerId)) {
                    case (null) { 0 };
                    case (?balance) { balance };
                };

                balances.put(playerId, currentBalance + totalFUDDY);

                // Clear deposits after conversion
                depositRecords.put(playerId, { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });

                // Log transaction
                _logTransaction(playerId, "Crystal to FUDDY Conversion", totalFUDDY);

                return #ok(totalFUDDY);
            }
        }
    };

    // FUDDY Transfer Method
    public func transferFUDDY(fromPlayerId : PlayerID, toPlayerId : PlayerID, amount : Nat) : async Result.Result<Text, Text> {
        // Validate both players
        switch (playerRegistry.get(fromPlayerId), playerRegistry.get(toPlayerId)) {
            case (null, _) { 
                return #err("Sender not registered") 
            };
            case (_, null) { 
                return #err("Receiver not registered") 
            };
            case (_, _) {
                // Get sender's balance
                let senderBalance = switch (balances.get(fromPlayerId)) {
                    case (null) { 0 };
                    case (?balance) { balance };
                };

                // Check sufficient funds
                if (amount > senderBalance) {
                    return #err("Insufficient funds");
                };

                // Get receiver's balance
                let receiverBalance = switch (balances.get(toPlayerId)) {
                    case (null) { 0 };
                    case (?balance) { balance };
                };

                // Update balances
                balances.put(fromPlayerId, senderBalance - amount);
                balances.put(toPlayerId, receiverBalance + amount);

                // Log transaction
                _logTransaction(fromPlayerId, "FUDDY Transfer to " # toPlayerId, amount);

                return #ok("Transfer successful");
            };
        }
    };

    // Get Player Balance
    public func getBalance(playerId : PlayerID) : async Nat {
        switch (balances.get(playerId)) {
            case (null) { 0 };
            case (?balance) { balance };
        }
    };

    // Buy FUDDY Method
    public func buyFUDDY(playerId : PlayerID, amount : Nat) : async Result.Result<Text, Text> {
        // Validate player
        switch (playerRegistry.get(playerId)) {
            case (null) { 
                return #err("Player not registered") 
            };
            case (_) {
                // Validate amount
                if (amount <= 0) {
                    return #err("Amount must be positive");
                };

                // Update player balance
                let currentBalance = switch (balances.get(playerId)) {
                    case (null) { 0 };
                    case (?balance) { balance };
                };

                balances.put(playerId, currentBalance + amount);

                // Log transaction
                _logTransaction(playerId, "FUDDY Purchase", amount);

                return #ok("Purchase successful");
            }
        }
    };

    // Transaction History Methods
    public func getTransactionHistory() : async [TransactionRecord] {
        transactionHistory
    };

    public func getPlayerTransactions(playerId : PlayerID) : async [TransactionRecord] {
        Array.filter(transactionHistory, func(record : TransactionRecord) : Bool {
            record.playerId == playerId
        })
    };

    // Economic Management Methods
    public func updateConversionRate(crystalType : Text, newRate : Nat) : async Bool {
        switch (crystalType) {
            case ("Type1") {
                conversionRates := { 
                    Type1 = newRate; 
                    Type2 = conversionRates.Type2; 
                    Type3 = conversionRates.Type3; 
                    Type4 = conversionRates.Type4 
                };
            };
            case ("Type2") {
                conversionRates := { 
                    Type1 = conversionRates.Type1; 
                    Type2 = newRate; 
                    Type3 = conversionRates.Type3; 
                    Type4 = conversionRates.Type4 
                };
            };
            case ("Type3") {
                conversionRates := { 
                    Type1 = conversionRates.Type1; 
                    Type2 = conversionRates.Type2; 
                    Type3 = newRate; 
                    Type4 = conversionRates.Type4 
                };
            };
            case ("Type4") {
                conversionRates := { 
                    Type1 = conversionRates.Type1; 
                    Type2 = conversionRates.Type2; 
                    Type3 = conversionRates.Type3; 
                    Type4 = newRate 
                };
            };
            case (_) { return false };
        };
        return true;
    };

    // Get Current Conversion Rates
    public query func getCurrentConversionRates() : async ?{Type1 : Nat; Type2 : Nat; Type3 : Nat; Type4 : Nat} {
        ?conversionRates
    };
}
