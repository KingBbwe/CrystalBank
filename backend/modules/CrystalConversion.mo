import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Iter "mo:base/Iter";

actor class CrystalConversion() {
    type PlayerID = Text;
    type CrystalType = {
        var Type1: Nat;
        var Type2: Nat;
        var Type3: Nat;
        var Type4: Nat;
    };

    private stable var conversionRates: CrystalType = {
        var Type1 = 1;
        var Type2 = 5;
        var Type3 = 10;
        var Type4 = 20
    };

    private stable var depositEntriesStable: [(PlayerID, CrystalType)] = [];
    private var depositRecords = HashMap.HashMap<PlayerID, CrystalType>(10, Text.equal, Text.hash);

    // Validated crystal type enum
    private type ValidCrystalType = {
        #Type1;
        #Type2;
        #Type3;
        #Type4;
    };

    private func getCrystalTypeFromText(crystalType: Text): ?ValidCrystalType {
        switch (crystalType) {
            case "Type1" { ?#Type1 };
            case "Type2" { ?#Type2 };
            case "Type3" { ?#Type3 };
            case "Type4" { ?#Type4 };
            case _ { null };
        };
    };

    public shared func updateConversionRate(crystal: Text, newRate: Nat): async Result.Result<Text, Text> {
        switch (getCrystalTypeFromText(crystal)) {
            case (?#Type1) { conversionRates.Type1 := newRate; #ok("Updated Type1 rate") };
            case (?#Type2) { conversionRates.Type2 := newRate; #ok("Updated Type2 rate") };
            case (?#Type3) { conversionRates.Type3 := newRate; #ok("Updated Type3 rate") };
            case (?#Type4) { conversionRates.Type4 := newRate; #ok("Updated Type4 rate") };
            case (null) { #err("Invalid crystal type") };
        };
    };

    public shared func depositCrystals(playerId: PlayerID, crystalType: Text, amount: Nat): async Result.Result<Text, Text> {
        if (amount == 0) {
            return #err("Amount must be positive");
        };

        let currentDeposits = switch (depositRecords.get(playerId)) {
            case (null) {{
                var Type1 = 0;
                var Type2 = 0;
                var Type3 = 0;
                var Type4 = 0;
            }};
            case (?deposits) { deposits };
        };

        switch (getCrystalTypeFromText(crystalType)) {
            case (?#Type1) { currentDeposits.Type1 += amount };
            case (?#Type2) { currentDeposits.Type2 += amount };
            case (?#Type3) { currentDeposits.Type3 += amount };
            case (?#Type4) { currentDeposits.Type4 += amount };
            case (null) { return #err("Invalid crystal type") };
        };

        depositRecords.put(playerId, currentDeposits);
        #ok("Deposit successful")
    };

    public shared func convertCrystalsToFUDDY(playerId: PlayerID): async Result.Result<Nat, Text> {
        switch (depositRecords.get(playerId)) {
            case (null) { #err("No deposits found for player") };
            case (?deposits) {
                let totalFUDDY = (deposits.Type1 * conversionRates.Type1) +
                                (deposits.Type2 * conversionRates.Type2) +
                                (deposits.Type3 * conversionRates.Type3) +
                                (deposits.Type4 * conversionRates.Type4);

                deposits.Type1 := 0;
                deposits.Type2 := 0;
                deposits.Type3 := 0;
                deposits.Type4 := 0;

                #ok(totalFUDDY)
            };
        }
    };

    public query func getDepositSummary(playerId: PlayerID): async CrystalType {
        switch (depositRecords.get(playerId)) {
            case (null) {{
                var Type1 = 0;
                var Type2 = 0;
                var Type3 = 0;
                var Type4 = 0;
            }};
            case (?deposits) { deposits };
        }
    };

    system func preupgrade() {
        depositEntriesStable := Iter.toArray(depositRecords.entries());
    };

    system func postupgrade() {
        depositRecords := HashMap.fromIter<PlayerID, CrystalType>(
            depositEntriesStable.vals(),
            10,
            Text.equal,
            Text.hash
        );
    };
}
