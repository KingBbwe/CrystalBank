import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

actor CrystalConversion {
    type PlayerID = Text;
    type CrystalType = { 
        Type1: Nat; 
        Type2: Nat; 
        Type3: Nat; 
        Type4: Nat 
    };

    stable var conversionRates: CrystalType = { Type1 = 1; Type2 = 5; Type3 = 10; Type4 = 20 };
    stable var depositRecords = HashMap.HashMap<PlayerID, CrystalType>(10, Text.equal, Text.hash);

    public shared func updateConversionRate(crystal: Text, newRate: Nat): async Bool {
        switch (crystal) {
            case ("Type1") { conversionRates.Type1 := newRate };
            case ("Type2") { conversionRates.Type2 := newRate };
            case ("Type3") { conversionRates.Type3 := newRate };
            case ("Type4") { conversionRates.Type4 := newRate };
        };
        return true;
    };

    public shared func depositCrystals(playerId: PlayerID, crystalType: Text, amount: Nat): async Result.Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let currentDeposits = depositRecords.get(playerId).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        switch (crystalType) {
            case ("Type1") { currentDeposits.Type1 += amount };
            case ("Type2") { currentDeposits.Type2 += amount };
            case ("Type3") { currentDeposits.Type3 += amount };
            case ("Type4") { currentDeposits.Type4 += amount };
        };
        depositRecords.put(playerId, currentDeposits);
        return #ok("Deposit successful");
    };

    public shared func convertCrystalsToFUDDY(playerId: PlayerID): async Result.Result<Nat, Text> {
        let deposits = depositRecords.get(playerId).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        let totalFUDDY = (deposits.Type1 * conversionRates.Type1) +
                         (deposits.Type2 * conversionRates.Type2) +
                         (deposits.Type3 * conversionRates.Type3) +
                         (deposits.Type4 * conversionRates.Type4);
        depositRecords.put(playerId, { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        return #ok(totalFUDDY);
    };

    public shared func getDepositSummary(playerId: PlayerID): async CrystalType {
        return depositRecords.get(playerId).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
    };

    // NEW: Direct transfer of crystals from one player to another.
    public shared func transferCrystals(from: PlayerID, to: PlayerID, crystalType: Text, amount: Nat): async Result.Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        // Fetch sender's deposits:
        let senderDeposits = depositRecords.get(from).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        switch (crystalType) {
            case ("Type1") {
                if (senderDeposits.Type1 < amount) { return #err("Insufficient Type1 crystals"); };
                senderDeposits.Type1 := senderDeposits.Type1 - amount;
            };
            case ("Type2") {
                if (senderDeposits.Type2 < amount) { return #err("Insufficient Type2 crystals"); };
                senderDeposits.Type2 := senderDeposits.Type2 - amount;
            };
            case ("Type3") {
                if (senderDeposits.Type3 < amount) { return #err("Insufficient Type3 crystals"); };
                senderDeposits.Type3 := senderDeposits.Type3 - amount;
            };
            case ("Type4") {
                if (senderDeposits.Type4 < amount) { return #err("Insufficient Type4 crystals"); };
                senderDeposits.Type4 := senderDeposits.Type4 - amount;
            };
        };
        depositRecords.put(from, senderDeposits);

        // Update receiver's deposits:
        let receiverDeposits = depositRecords.get(to).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        switch (crystalType) {
            case ("Type1") { receiverDeposits.Type1 += amount };
            case ("Type2") { receiverDeposits.Type2 += amount };
            case ("Type3") { receiverDeposits.Type3 += amount };
            case ("Type4") { receiverDeposits.Type4 += amount };
        };
        depositRecords.put(to, receiverDeposits);
        return #ok("Crystal transfer successful");
    };
};