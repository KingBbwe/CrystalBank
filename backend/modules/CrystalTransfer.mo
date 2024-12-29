import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Error "mo:base/Error";

actor class CrystalTransfer(crystalBankId: Principal, gameCoordinatorId: Principal) {
    // Type definitions
    type PlayerID = Text;
    type CrystalType = {
        #Type1;
        #Type2;
        #Type3;
        #Type4;
    };

    // Actor references
    let crystalBank = actor(crystalBankId) : actor {
        depositCrystals: (playerId: Text, crystalType: Text, amount: Nat) -> async Result.Result<Text, Text>;
    };

    let gameCoordinator = actor(gameCoordinatorId) : actor {
        isPlayerRegistered: (playerId: Text) -> async Bool;
        getPlayerFullProfile: (playerId: Text) -> async Result.Result<{
            profile: ?UserProfile;
            nfts: [NFT];
            balances: {
                crystalBankBalance: Nat;
                hybridWalletBalance: {inGameFuddy: Nat; realFuddy: Nat};
                marketBalance: Nat;
            };
            isRegistered: Bool;
        }, Text>;
    };

    // Transfer crystals between players
    public shared func transferCrystals(
        fromPlayerId: PlayerID,
        toPlayerId: PlayerID,
        crystalType: CrystalType,
        amount: Nat
    ) : async Result.Result<Text, Text> {
        // Check if both players are registered
        let isFromPlayerRegistered = await gameCoordinator.isPlayerRegistered(fromPlayerId);
        let isToPlayerRegistered = await gameCoordinator.isPlayerRegistered(toPlayerId);

        if (not isFromPlayerRegistered or not isToPlayerRegistered) {
            return #err("One or both players are not registered");
        };

        // Validate amount
        if (amount <= 0) {
            return #err("Amount must be positive");
        };

        // Get the crystal type as text
        let crystalTypeText = switch (crystalType) {
            case (#Type1) "Type1";
            case (#Type2) "Type2";
            case (#Type3) "Type3";
            case (#Type4) "Type4";
        };

        // Deposit crystals to the recipient
        let depositResult = await crystalBank.depositCrystals(toPlayerId, crystalTypeText, amount);
        switch (depositResult) {
            case (#err(e)) return #err("Failed to deposit crystals: " # e);
            case (#ok(_)) return #ok("Transfer successful");
        };
    };

    // GM distributes crystals to players
    public shared({ caller }) func distributeCrystals(
        playerId: PlayerID,
        crystalType: CrystalType,
        amount: Nat
    ) : async Result.Result<Text, Text> {
        // Check if the caller is a GM
        let callerProfile = await gameCoordinator.getPlayerFullProfile(Principal.toText(caller));
        switch (callerProfile) {
            case (#err(e)) return #err("Failed to verify GM status: " # e);
            case (#ok(profile)) {
                if (profile.profile?.accountTier != #GameMaster) {
                    return #err("Only Game Masters can distribute crystals");
                };
            };
        };

        // Validate amount
        if (amount <= 0) {
            return #err("Amount must be positive");
        };

        // Get the crystal type as text
        let crystalTypeText = switch (crystalType) {
            case (#Type1) "Type1";
            case (#Type2) "Type2";
            case (#Type3) "Type3";
            case (#Type4) "Type4";
        };

        // Deposit crystals to the player
        let depositResult = await crystalBank.depositCrystals(playerId, crystalTypeText, amount);
        switch (depositResult) {
            case (#err(e)) return #err("Failed to deposit crystals: " # e);
            case (#ok(_)) return #ok("Distribution successful");
        };
    };
}
