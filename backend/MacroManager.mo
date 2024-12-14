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

    // Player economic activity tracking
    type PlayerEconomicProfile = {
        totalDeposits : Nat;
        totalWithdrawals : Nat;
        lastActivityTimestamp : Time.Time;
        behaviorScore : Float;
    };

    private stable var playerProfiles : [(Text, PlayerEconomicProfile)] = [];
    private var playerProfilesMap = HashMap.fromIter<Text, PlayerEconomicProfile>(
        playerProfiles.vals(), 
        10, 
        Text.equal, 
        Text.hash
    );

    // Machine Learning Inspired Economic Adjustment Function
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
    }

    // Log and update player economic activity
    public func updatePlayerEconomicProfile(
        playerId : Text, 
        actionType : Text, 
        amount : Nat
    ) : async Result.Result<Text, Text> {
        switch (playerProfilesMap.get(playerId)) {
            case (null) {
                let newProfile : PlayerEconomicProfile = {
                    totalDeposits = if (actionType == "deposit") amount else 0;
                    totalWithdrawals = if (actionType == "withdraw") amount else 0;
                    lastActivityTimestamp = Time.now();
                    behaviorScore = 1.0;
                };
                playerProfilesMap.put(playerId, newProfile);
            };
            case (?existingProfile) {
                let updatedProfile = {
                    totalDeposits = if (actionType == "deposit") 
                        existingProfile.totalDeposits + amount 
                        else existingProfile.totalDeposits;
                    totalWithdrawals = if (actionType == "withdraw") 
                        existingProfile.totalWithdrawals + amount 
                        else existingProfile.totalWithdrawals;
                    lastActivityTimestamp = Time.now();
                    behaviorScore = calculateBehaviorScore(existingProfile, amount, actionType);
                };
                playerProfilesMap.put(playerId, updatedProfile);
            };
        };
        #ok("Profile Updated")
    }

    // Simple behavior scoring mechanism
    private func calculateBehaviorScore(
        profile : PlayerEconomicProfile, 
        amount : Nat, 
        actionType : Text
    ) : Float {
        // Basic scoring logic based on deposit/withdrawal patterns
        let baseScore = profile.behaviorScore;
        let scoreFactor = switch (actionType) {
            case ("deposit") { 1.1 };
            case ("withdraw") { 0.9 };
            case (_) { 1.0 };
        };
        return baseScore * scoreFactor;
    }

    // Retrieve comprehensive economic snapshot
    public query func getEconomicSnapshot() : async {
        totalCrystals : Nat;
        totalFUDDY : Nat;
        currentConversionRate : Float;
    } {
        {
            totalCrystals = totalCrystals;
            totalFUDDY = totalFUDDY;
            currentConversionRate = conversionRate;
        }
    }

    // System upgrade hook to persist data
    system func preupgrade() {
        playerProfiles := Iter.toArray(playerProfilesMap.entries());
    }

    system func postupgrade() {
        playerProfilesMap := HashMap.fromIter<Text, PlayerEconomicProfile>(
            playerProfiles.vals(), 
            10, 
            Text.equal, 
            Text.hash
        );
    }
}
