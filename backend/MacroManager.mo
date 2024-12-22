// Macro Manager Canister for Crystal Bank Economic System
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Int "mo:base/Int";

actor MacroManager {
    type ActivityType = {
        #Deposit;
        #Withdrawal;
        #Transfer;
        #Conversion;
        #Reward;
        #Penalty;
    };

    // Account Roles
    type AccountRole = {
        #Player;
        #GM;
        #SystemReserve;
    };

    // Comprehensive Account Structure
    type AccountProfile = {
        Principal : Principal;
        Role : AccountRole;
        realFuddyBalance : Nat;
        inGameFuddyBalance : Nat;
        crystalBalance : Nat;
        behaviorScore : Float;
        lastActivityTimestamp : Time.Time;
        activityHistory : [EconomicActivity];
    };

    // Detailed Economic Activity Logging

    type EconomicActivity = {

        Timestamp : Time.Time;

        activityType : ActivityType;

        amount : Nat;

        counterparty : ?Principal;

        notes : ?Text;

    };



    // Conversion and Transfer Policies

    type ConversionPolicy = {

        minRealFuddyForConversion : Nat;

        conversionFeePercentage : Float;

        dailyTransferLimit : Nat;

    };

    // Governance and Economic Parameters

    private stable var conversionPolicy : ConversionPolicy = {
        minRealFuddyForConversion = 100_000; // 100 $FUDDY minimum
        conversionFeePercentage = 0.05; // 5% conversion fee
        dailyTransferLimit = 1_000_000 // 1000 $FUDDY per day
    };

    // Account Management
    private var accountProfiles = HashMap.HashMap<Principal, AccountProfile>(
        10, 
        Principal.equal, 
        Principal.hash
    );

    // Economic Stability Mechanisms
    private stable var systemReserveRealFuddy : Nat = 0;
    private stable var totalCirculatingRealFuddy : Nat = 0;
    private stable var totalCirculatingInGameFuddy : Nat = 0;

    // Transfer Real $FUDDY Between Accounts
    public shared(msg) func transferRealFuddy(
        recipient : Principal, 
        amount : Nat
    ) : async Result.Result<Text, Text> {
        let sender = msg.caller;
        // Validate sender’s account
        let ?senderProfile = accountProfiles.get(sender) 
            else return #err("Sender account not found");

        // Check sender’s balance
        if (senderProfile.realFuddyBalance < amount) {
            return #err("Insufficient Real $FUDDY balance");
        };

        // Validate recipient’s account
        let ?recipientProfile = accountProfiles.get(recipient) 
            else return #err("Recipient account not found");

        // Check daily transfer limit

        let dailyTransferTotal = calculateDailyTransferTotal(sender);

        if (dailyTransferTotal + amount > conversionPolicy.dailyTransferLimit) {
            return #err("Daily transfer limit exceeded");
        };



        // Perform transfer

        let updatedSenderProfile : AccountProfile = {

            senderProfile with realFuddyBalance = senderProfile.realFuddyBalance - amount;

            activityHistory = Array.append(

                senderProfile.activityHistory, 

                [_createEconomicActivity(
                    #Transfer, 
                    amount, 
                    ?recipient, 
                    "Real $FUDDY Transfer to " # debug_show(recipient)
                )]

            )

        };



        let updatedRecipientProfile : AccountProfile = {

            recipientProfile with 

            realFuddyBalance = recipientProfile.realFuddyBalance + amount;

            activityHistory = Array.append(
                recipientProfile.activityHistory, 
                [_createEconomicActivity(
                    #Transfer, 
                    amount, 
                    ?sender, 
                    "Real $FUDDY Received from " # debug_show(sender)
                )]
            )
        };



        accountProfiles.put(sender, updatedSenderProfile);

        accountProfiles.put(recipient, updatedRecipientProfile);



        #ok("Transfer Successful")

    };



    // Convert In-Game FUDDY to Real $FUDDY

    public shared(msg) func convertToRealFuddy(

        amount : Nat

    ) : async Result.Result<Text, Text> {
        let caller = msg.caller;
        // Validate account
        let ?accountProfile = accountProfiles.get(caller) 
            else return #err("Account not found");

        // Check conversion eligibility
        if (accountProfile.inGameFuddyBalance < amount) {
            return #err("Insufficient In-Game FUDDY balance");
        };

        // Check minimum conversion threshold

        if (amount < conversionPolicy.minRealFuddyForConversion) {
            return #err("Conversion amount below minimum threshold");
        };

        // Calculate conversion with fee
        let conversionFee = Float.toInt(Float.fromInt(amount) * conversionPolicy.conversionFeePercentage);
        let netConversionAmount = amount - conversionFee;

        // Update account balances
        let updatedProfile : AccountProfile = {
            accountProfile with inGameFuddyBalance = Nat.sub(accountProfile.inGameFuddyBalance, amount);
            realFuddyBalance = accountProfile.realFuddyBalance + netConversionAmount;
            activityHistory = Array.append(
                accountProfile.activityHistory, 
                [_createEconomicActivity(
                    #Conversion, 
                    amount, 
                    null, 
                    "Conversion to Real $FUDDY with fee"
                )]
            )
        };

        // Update system reserves
        systemReserveRealFuddy += Nat.fromInt(conversionFee);
        totalCirculatingRealFuddy += Nat.fromInt(netConversionAmount);
        totalCirculatingInGameFuddy -= amount;
        accountProfiles.put(caller, updatedProfile);
        #ok("Conversion Successful")
    };

    // Advanced Economic Health Check

    public query func getEconomicHealthIndicators() : async {

        totalRealFuddy : Nat;

        totalInGameFuddy : Nat;

        systemReserve : Nat;

        averageBehaviorScore : Float;

    } {

        let behaviorScores = Buffer.Buffer<Float>(accountProfiles.size());

        

        for ((_, profile) in accountProfiles.entries()) {

            behaviorScores.add(profile.behaviorScore);

        };



        {

            totalRealFuddy = totalCirculatingRealFuddy;

            totalInGameFuddy = totalCirculatingInGameFuddy;

            systemReserve = systemReserveRealFuddy;

            averageBehaviorScore = _calculateAverageBehaviorScore(behaviorScores);

        }

    };



    // Penalty and Reward Mechanism

    public shared(msg) func adjustAccountBehaviorScore(

        targetAccount : Principal,

        adjustmentType : {#Reward; #Penalty},

        amount : Float

    ) : async Result.Result<Text, Text> {

        let adminCaller = msg.caller;
        // Ensure only GMs can adjust scores
        let ?callerProfile = accountProfiles.get(adminCaller)
            else return #err("Unauthorized");

        if (callerProfile.role != #GM) {
            return #err("Only Game Masters can adjust behavior scores");
        };

        let ?targetProfile = accountProfiles.get(targetAccount)
            else return #err("Target account not found");

        let adjustedScore = switch (adjustmentType) {
            case (#Reward) { targetProfile.behaviorScore + amount };
            case (#Penalty) { targetProfile.behaviorScore - amount };
        };

        // Prevent score from going below zero
        let finalScore = Float.max(0, adjustedScore);
        let updatedProfile : AccountProfile = {
            targetProfile with behaviorScore = finalScore;
            activityHistory = Array.append(
                targetProfile.activityHistory, 

                [_createEconomicActivity(
                    switch (adjustmentType) {
                        case (#Reward) #Reward;
                        case (#Penalty) #Penalty;
                    }, 
                    Nat.fromInt(amount), 
                    ?adminCaller, 
                    "Behavior Score Adjustment"
                )]
            )
        };
        accountProfiles.put(targetAccount, updatedProfile);
        #ok("Behavior Score Adjusted")
    };
    // Utility Functions

    private func _createEconomicActivity(
        activityType : ActivityType, 
        amount : Nat, 
        counterparty : ?Principal,
        notes : Text
    ) : EconomicActivity {
        {
            Timestamp = Time.now();
            activityType = activityType;
            amount = amount;
            counterparty = counterparty;
            notes = ?notes;
        }
    };

    private func calculateDailyTransferTotal(
        Account : Principal
    ) : Nat {
        // Calculate total transfers in last 24 hours
        0 // Placeholder – would implement full time-based calculation
    };

    private func _calculateAverageBehaviorScore(
        scores : Buffer.Buffer<Float>
    ) : Float {
        var total = 0.0;
        for (score in scores.vals()) {
            total += score;
        };
        total / Float.fromInt(scores.size())
    }
}
