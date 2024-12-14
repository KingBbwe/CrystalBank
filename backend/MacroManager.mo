// Macro Manager Canister for Crystal Bank Economic System
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Principal "mo:base/Principal";

actor MacroManager {
    // Economic parameters
    private stable var conversionRate : Float = 1.0;
    private stable var totalCrystals : Nat = 0;
    private stable var totalFUDDY : Nat = 0;
    private stable var systemReserveRealFuddy : Nat = 0;
    private stable var totalCirculatingRealFuddy : Nat = 0;
    private stable var totalCirculatingInGameFuddy : Nat = 0;

    // Player economic activity tracking
    type PlayerEconomicProfile = {
        realFuddyBalance : Nat;
        inGameFuddyBalance : Nat;
        crystalBalance : Nat;
        totalDeposits : Nat;
        totalWithdrawals : Nat;
        behaviorScore : Float;
        lastActivityTimestamp : Time.Time;
    };

    private stable var playerProfiles : [(Principal, PlayerEconomicProfile)] = [];
    private var playerProfilesMap = HashMap.fromIter<Principal, PlayerEconomicProfile>(
        playerProfiles.vals(),
        10,
        Principal.equal,
        Principal.hash
    );

    // Conversion policies
    type ConversionPolicy = {
        minRealFuddyForConversion : Nat;
        conversionFeePercentage : Float;
        dailyTransferLimit : Nat;
    };

    private stable var conversionPolicy : ConversionPolicy = {
        minRealFuddyForConversion = 100_000;
        conversionFeePercentage = 0.05;
        dailyTransferLimit = 1_000_000;
    };

    // Adjust economic parameters dynamically
    public func adjustEconomicParameters(
        supply : Nat,
        demand : Nat
    ) : async Float {
        let supplyDemandRatio = Float.fromInt(demand) / Float.fromInt(supply);

        // Dynamic conversion rate adjustment
        let adjustedRate = switch (supplyDemandRatio) {
            case (r) if (r > 1.5) { conversionRate * 1.1 };  // High demand
            case (r) if (r < 0.5) { conversionRate * 0.9 };  // Low demand
            case (_) { conversionRate };                     // Stable state
        };

        conversionRate := adjustedRate;
        return adjustedRate;
    };

    // Update player economic profile with redundancy checks
    public func updatePlayerEconomicProfile(
        playerId : Principal,
        actionType : Text,
        amount : Nat
    ) : async Result.Result<Text, Text> {
        switch (playerProfilesMap.get(playerId)) {
            case (null) {
                let newProfile : PlayerEconomicProfile = {
                    realFuddyBalance = 0;
                    inGameFuddyBalance = 0;
                    crystalBalance = 0;
                    totalDeposits = if (actionType == "deposit") amount else 0;
                    totalWithdrawals = if (actionType == "withdraw") amount else 0;
                    behaviorScore = 1.0;
                    lastActivityTimestamp = Time.now();
                };
                playerProfilesMap.put(playerId, newProfile);
            };
            case (?existingProfile) {
                let updatedProfile = {
                    realFuddyBalance = existingProfile.realFuddyBalance;
                    inGameFuddyBalance = existingProfile.inGameFuddyBalance;
                    crystalBalance = existingProfile.crystalBalance;
                    totalDeposits = if (actionType == "deposit")
                        existingProfile.totalDeposits + amount
                        else existingProfile.totalDeposits;
                    totalWithdrawals = if (actionType == "withdraw")
                        existingProfile.totalWithdrawals + amount
                        else existingProfile.totalWithdrawals;
                    behaviorScore = calculateBehaviorScore(existingProfile, amount, actionType);
                    lastActivityTimestamp = Time.now();
                };
                playerProfilesMap.put(playerId, updatedProfile);
            };
        };
        #ok("Profile Updated")
    };

    // Convert in-game FUDDY to real $FUDDY with fee calculation
    public func convertToRealFuddy(
        playerId : Principal,
        amount : Nat
    ) : async Result.Result<Text, Text> {
        let ?playerProfile = playerProfilesMap.get(playerId)
            else return #err("Player not found");

        if (playerProfile.inGameFuddyBalance < amount) {
            return #err("Insufficient in-game FUDDY balance");
        };

        if (amount < conversionPolicy.minRealFuddyForConversion) {
            return #err("Conversion amount below minimum threshold");
        };

        let fee = Float.fromInt(amount) * conversionPolicy.conversionFeePercentage;
        let netAmount = amount - Nat.fromFloat(fee);

        let updatedProfile = {
            playerProfile with
            inGameFuddyBalance = playerProfile.inGameFuddyBalance - amount;
            realFuddyBalance = playerProfile.realFuddyBalance + netAmount;
        };

        systemReserveRealFuddy += Nat.fromFloat(fee);
        totalCirculatingInGameFuddy -= amount;
        totalCirculatingRealFuddy += netAmount;

        playerProfilesMap.put(playerId, updatedProfile);

        #ok("Conversion Successful")
    };

    // Retrieve economic snapshot
    public query func getEconomicSnapshot() : async {
        totalCrystals : Nat;
        totalFUDDY : Nat;
        systemReserve : Nat;
        conversionRate : Float;
    } {
        {
            totalCrystals = totalCrystals;
            totalFUDDY = totalFUDDY;
            systemReserve = systemReserveRealFuddy;
            conversionRate = conversionRate;
        }
    };

    // System upgrade hooks
    system func preupgrade() {
        playerProfiles := Iter.toArray(playerProfilesMap.entries());
    };

    system func postupgrade() {
        playerProfilesMap := HashMap.fromIter<Principal, PlayerEconomicProfile>(
            playerProfiles.vals(),
            10,
            Principal.equal,
            Principal.hash
        );
    };

    // Utility for calculating behavior score
    private func calculateBehaviorScore(
        profile : PlayerEconomicProfile,
        amount : Nat,
        actionType : Text
    ) : Float {
        let baseScore = profile.behaviorScore;
        let scoreFactor = switch (actionType) {
            case ("deposit") { 1.1 };
            case ("withdraw") { 0.9 };
            case (_) { 1.0 };
        };
        return baseScore * scoreFactor;
    };
}
