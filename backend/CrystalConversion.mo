actor CrystalConversion {
    type PlayerID = Text;
    type CrystalType = { Type1: Nat; Type2: Nat; Type3: Nat; Type4: Nat };
    stable var conversionRates: { Type1: Nat; Type2: Nat; Type3: Nat; Type4: Nat } = { Type1 = 1; Type2 = 5; Type3 = 10; Type4 = 20 };
    stable var depositRecords: Map<PlayerID, CrystalType> = Map.empty();

    public func updateConversionRate(type: Text, newRate: Nat): async Bool {
        switch (type) {
            case ("Type1") { conversionRates.Type1 := newRate; };
            case ("Type2") { conversionRates.Type2 := newRate; };
            case ("Type3") { conversionRates.Type3 := newRate; };
            case ("Type4") { conversionRates.Type4 := newRate; };
            default { return false; // Invalid crystal type };
        };
        return true;
    };

    public func depositCrystals(playerId: PlayerID, crystalType: Text, amount: Nat): async Result<Text, Text> {
        if (amount <= 0) {
            return #err("Amount must be positive");
        };
        let mut currentDeposits = Map.get(depositRecords, playerId) ?? { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 };
        switch (crystalType) {
            case ("Type1") { currentDeposits.Type1 += amount; };
            case ("Type2") { currentDeposits.Type2 += amount; };
            case ("Type3") { currentDeposits.Type3 += amount; };
            case ("Type4") { currentDeposits.Type4 += amount; };
            default { return #err("Invalid crystal type"); };
        };
        depositRecords := Map.put(depositRecords, playerId, currentDeposits);
        return #ok("Deposit successful");
    };

    public func convertCrystalsToFUDDY(playerId: PlayerID): async Result<Nat, Text> {
        let deposits = Map.get(depositRecords, playerId) ?? { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 };
        let totalFUDDY = (deposits.Type1 * conversionRates.Type1) +
                         (deposits.Type2 * conversionRates.Type2) +
                         (deposits.Type3 * conversionRates.Type3) +
                         (deposits.Type4 * conversionRates.Type4);

        depositRecords := Map.put(depositRecords, playerId, { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 });
        return #ok(totalFUDDY);
    };

    public func getDepositSummary(playerId: PlayerID): async CrystalType {
        return Map.get(depositRecords, playerId) ?? { Type1 = 0; Type2 = 0; Type3 = 0; Type4 = 0 };
    };
};

