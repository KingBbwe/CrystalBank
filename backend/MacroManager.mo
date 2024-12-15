// Macro Manager Canister for Crystal Bank Economic System

Import Result “mo:base/Result”;

Import HashMap “mo:base/HashMap”;

Import Nat “mo:base/Nat”;

Import Text “mo:base/Text”;

Import Time “mo:base/Time”;

Import Array “mo:base/Array”;

Import Float “mo:base/Float”;

Import Principal “mo:base/Principal”;

Import Buffer “mo:base/Buffer”;

Import Option “mo:base/Option”;



Actor MacroManager {

    // Economic Activity Types

    Type ActivityType = {

        #Deposit;

        #Withdrawal;

        #Transfer;

        #Conversion;

        #Reward;

        #Penalty;

    };



    // Account Roles

    Type AccountRole = {

        #Player;

        #GM;

        #SystemReserve;

    };



    // Comprehensive Account Structure

    Type AccountProfile = {

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

    Type EconomicActivity = {

        Timestamp : Time.Time;

        activityType : ActivityType;

        amount : Nat;

        counterparty : ?Principal;

        notes : ?Text;

    };



    // Conversion and Transfer Policies

    Type ConversionPolicy = {

        minRealFuddyForConversion : Nat;

        conversionFeePercentage : Float;

        dailyTransferLimit : Nat;

    };



    // Governance and Economic Parameters

    Private stable var conversionPolicy : ConversionPolicy = {

        minRealFuddyForConversion = 100_000; // 100 $FUDDY minimum

        conversionFeePercentage = 0.05; // 5% conversion fee

        dailyTransferLimit = 1_000_000 // 1000 $FUDDY per day

    };



    // Account Management

    Private stable var accountProfiles = HashMap.HashMap<Principal, AccountProfile>(

        10, 

        Principal.equal, 

        Principal.hash

    );



    // Economic Stability Mechanisms

    Private stable var systemReserveRealFuddy : Nat = 0;

    Private stable var totalCirculatingRealFuddy : Nat = 0;

    Private stable var totalCirculatingInGameFuddy : Nat = 0;



    // Transfer Real $FUDDY Between Accounts

    Public shared(msg) func transferRealFuddy(

        Recipient : Principal, 

        Amount : Nat

    ) : async Result.Result<Text, Text> {

        Let sender = msg.caller;



        // Validate sender’s account

        Let ?senderProfile = accountProfiles.get(sender) 

            Else return #err(“Sender account not found”);



        // Check sender’s balance

        If (senderProfile.realFuddyBalance < amount) {

            Return #err(“Insufficient Real $FUDDY balance”);

        }



        // Validate recipient’s account

        Let ?recipientProfile = accountProfiles.get(recipient) 

            Else return #err(“Recipient account not found”);



        // Check daily transfer limit

        Let dailyTransferTotal = calculateDailyTransferTotal(sender);

        If (dailyTransferTotal + amount > conversionPolicy.dailyTransferLimit) {

            Return #err(“Daily transfer limit exceeded”);

        }



        // Perform transfer

        Let updatedSenderProfile : AccountProfile = {

            senderProfile with 

            realFuddyBalance = senderProfile.realFuddyBalance – amount;

            activityHistory = Array.append(

                senderProfile.activityHistory, 

                [_createEconomicActivity(

                    #Transfer, 

                    Amount, 

                    ?recipient, 

                    ?”Real $FUDDY Transfer to “ # debug_show(recipient)

                )]

            )

        };



        Let updatedRecipientProfile : AccountProfile = {

            recipientProfile with 

            realFuddyBalance = recipientProfile.realFuddyBalance + amount;

            activityHistory = Array.append(

                recipientProfile.activityHistory, 

                [_createEconomicActivity(

                    #Transfer, 

                    Amount, 

                    ?sender, 

                    ?”Real $FUDDY Received from “ # debug_show(sender)

                )]

            )

        };



        accountProfiles.put(sender, updatedSenderProfile);

        accountProfiles.put(recipient, updatedRecipientProfile);



        #ok(“Transfer Successful”)

    }



    // Convert In-Game FUDDY to Real $FUDDY

    Public shared(msg) func convertToRealFuddy(

        Amount : Nat

    ) : async Result.Result<Text, Text> {

        Let caller = msg.caller;



        // Validate account

        Let ?accountProfile = accountProfiles.get(caller) 

            Else return #err(“Account not found”);



        // Check conversion eligibility

        If (accountProfile.inGameFuddyBalance < amount) {

            Return #err(“Insufficient In-Game FUDDY balance”);

        }



        // Check minimum conversion threshold

        If (amount < conversionPolicy.minRealFuddyForConversion) {

            Return #err(“Conversion amount below minimum threshold”);

        }



        // Calculate conversion with fee

        Let conversionFee = Float.toInt(Float.fromInt(amount) * conversionPolicy.conversionFeePercentage);

        Let netConversionAmount = amount – conversionFee;



        // Update account balances

        Let updatedProfile : AccountProfile = {

            accountProfile with

            inGameFuddyBalance = accountProfile.inGameFuddyBalance – amount;

            realFuddyBalance = accountProfile.realFuddyBalance + netConversionAmount;

            activityHistory = Array.append(

                accountProfile.activityHistory, 

                [_createEconomicActivity(

                    #Conversion, 

                    Amount, 

                    Null, 

                    ?”Conversion to Real $FUDDY with fee”

                )]

            )

        };



        // Update system reserves

        systemReserveRealFuddy += conversionFee;

        totalCirculatingRealFuddy += netConversionAmount;

        totalCirculatingInGameFuddy -= amount;



        accountProfiles.put(caller, updatedProfile);



        #ok(“Conversion Successful”)

    }



    // Advanced Economic Health Check

    Public query func getEconomicHealthIndicators() : async {

        totalRealFuddy : Nat;

        totalInGameFuddy : Nat;

        systemReserve : Nat;

        averageBehaviorScore : Float;

    } {

        Let behaviorScores = Buffer.Buffer<Float>(accountProfiles.size());

        

        For ((_, profile) in accountProfiles.entries()) {

            behaviorScores.add(profile.behaviorScore);

        };



        {

            totalRealFuddy = totalCirculatingRealFuddy;

            totalInGameFuddy = totalCirculatingInGameFuddy;

            systemReserve = systemReserveRealFuddy;

            averageBehaviorScore = _calculateAverageBehaviorScore(behaviorScores);

        }

    }



    // Penalty and Reward Mechanism

    Public shared(msg) func adjustAccountBehaviorScore(

        targetAccount : Principal,

        adjustmentType : {#Reward; #Penalty},

        amount : Float

    ) : async Result.Result<Text, Text> {

        Let adminCaller = msg.caller;



        // Ensure only GMs can adjust scores

        Let ?callerProfile = accountProfiles.get(adminCaller)

            Else return #err(“Unauthorized”);

        

        If (callerProfile.role != #GM) {

            Return #err(“Only Game Masters can adjust behavior scores”);

        }



        Let ?targetProfile = accountProfiles.get(targetAccount)

            Else return #err(“Target account not found”);



        Let adjustedScore = switch (adjustmentType) {

            Case (#Reward) { targetProfile.behaviorScore + amount };

            Case (#Penalty) { targetProfile.behaviorScore – amount };

        };



        // Prevent score from going below zero

        Let finalScore = Float.max(0, adjustedScore);



        Let updatedProfile : AccountProfile = {

            targetProfile with 

            behaviorScore = finalScore;

            activityHistory = Array.append(

                targetProfile.activityHistory, 

                [_createEconomicActivity(

                    Switch (adjustmentType) {

                        Case (#Reward) #Reward;

                        Case (#Penalty) #Penalty;

                    }, 

                    Nat.fromFloat(amount), 

                    ?adminCaller, 

                    ?”Behavior Score Adjustment”

                )]

            )

        };



        accountProfiles.put(targetAccount, updatedProfile);



        #ok(“Behavior Score Adjusted”)

    }



    // Utility Functions

    Private func _createEconomicActivity(

        activityType : ActivityType, 

        amount : Nat, 

        counterparty : ?Principal,

        notes : ?Text

    ) : EconomicActivity {

        {

            Timestamp = Time.now();

            activityType = activityType;

            amount = amount;

            counterparty = counterparty;

            notes = notes;

        }

    }



    Private func calculateDailyTransferTotal(

        Account : Principal

    ) : Nat {

        // Calculate total transfers in last 24 hours

        0 // Placeholder – would implement full time-based calculation

    }



    Private func _calculateAverageBehaviorScore(

        Scores : Buffer.Buffer<Float>

    ) : Float {

        Var total = 0.0;

        For (score in scores.vals()) {

            Total += score;

        };

        Total / Float.fromInt(scores.size())

    }

}


