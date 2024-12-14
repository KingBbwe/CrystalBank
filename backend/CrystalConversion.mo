import HashMap "mo:base/HashMap";

actor CrystalConversion {
    type PlayerID = Text;
    type CrystalType = { Type1: Nat; Type2: Nat; Type3: Nat; Type4: Nat };

    stable var conversionRates: CrystalType = { Type1 = 1; Type2 = 5; Type3 = 10; Type4 = 20 };
    stable var depositRecords: HashMap.HashMap<PlayerID, CrystalType> = HashMap.HashMap();

    public shared func updateConversionRate(crystal: Text, newRate: Nat): async Bool {
        switch (crystal) {
            case ("Type1") { conversionRates.Type1 := newRate };
            case ("Type2") { conversionRates.Type2 := newRate };
            case ("Type3") { conversionRates.Type3 := newRate };
            case ("Type4") { conversionRates.Type4 := newRate };
            // else return false;
        };
        return true;
    };

    public shared func depositCrystals(playerId: PlayerID, crystalType: Text, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };

        let currentDeposits = depositRecords.get(playerId).unwrapOr({ Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        switch (crystalType) {
            case ("Type1") { currentDeposits.Type1 += amount };
            case ("Type2") { currentDeposits.Type2 += amount };
            case ("Type3") { currentDeposits.Type3 += amount };
            case ("Type4") { currentDeposits.Type4 += amount };
            // else return #err("Invalid crystal type");
        };
        depositRecords.put(playerId, currentDeposits);
        return #ok("Deposit successful");
    };

    public shared func convertCrystalsToFUDDY(playerId: PlayerID): async Result<Nat, Text> {
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
};
