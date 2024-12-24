import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import HashSet "mo:base/HashSet";
import Array "mo:base/Array";
import Error "mo:base/Error";

actor class GameCoordinator(
    crystalBankId: Principal,
    transactionLoggerId: Principal,
    crystalConversionId: Principal,
    fuddyTransferId: Principal,
    fuddyConversionId: Principal,
    gameAuthenticatorId: Principal,
    hybridWalletId: Principal,
    liquidityPoolId: Principal,
    macroManagerId: Principal,
    marketInteractionId: Principal
) {
    // Type Definitions
    type AccountTier = {
        #Novice;
        #Regular;
        #Veteran;
        #Elite;
        #GameMaster;
    };

    type UserProfile = {
        username: Text;
        email: ?Text;
        registrationTimestamp: Time.Time;
        lastLoginTimestamp: Time.Time;
        accountTier: AccountTier;
        referralCode: Text;
        linkedAccounts: [Principal];
    };

    type NFT = {
        id: Nat;
        name: Text;
        description: Text;
        timestamp: Int;
        owner: Text;
    };

    // State Variables
    private stable var playerNFTs: HashMap.HashMap<Text, [NFT]> = HashMap.HashMap();
    private stable var registeredPlayers: HashSet.HashSet<Text> = HashSet.HashSet();
    private stable var nextNFTId: Nat = 1;

    // Actor References
    let crystalBank = actor(crystalBankId) : actor {
        registerPlayer: (playerId: Text) -> async Bool;
        depositCrystals: (playerId: Text, crystalType: Text, amount: Nat) -> async Result.Result<Text, Text>;
        convertCrystalsToFUDDY: (playerId: Text) -> async Result.Result<Nat, Text>;
        transferFUDDY: (fromPlayerId: Text, toPlayerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        getBalance: (playerId: Text) -> async Nat;
    };

    let gameAuthenticator = actor(gameAuthenticatorId) : actor {
        createOrUpdateProfile: (username: Text, email: ?Text, authMethod: {#EmailPassword; #GoogleSSO; #BlockchainWallet}) -> async Result.Result<UserProfile, Text>;
        getUserProfile: (principal: Principal) -> async ?UserProfile;
        applyReferralCode: (referralCode: Text) -> async Result.Result<Text, Text>;
    };

    let hybridWallet = actor(hybridWalletId) : actor {
        depositRealFuddy: (playerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        transferRealFuddy: (from: Text, to: Text, amount: Nat) -> async Result.Result<Text, Text>;
        convertToInGameFuddy: (playerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        spendInGameFuddy: (playerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        getBalances: (playerId: Text) -> async {inGameFuddy: Nat; realFuddy: Nat};
    };

    let liquidityPool = actor(liquidityPoolId) : actor {
        acquireFUDDYFromPool: (playerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        getPoolBalance: () -> async Nat;
    };

    let macroManager = actor(macroManagerId) : actor {
        transferRealFuddy: (recipient: Principal, amount: Nat) -> async Result.Result<Text, Text>;
        convertToRealFuddy: (amount: Nat) -> async Result.Result<Text, Text>;
        getEconomicHealthIndicators: () -> async {
            totalRealFuddy: Nat;
            totalInGameFuddy: Nat;
            systemReserve: Nat;
            averageBehaviorScore: Float;
        };
        adjustAccountBehaviorScore: (targetAccount: Principal, adjustmentType: {#Reward; #Penalty}, amount: Float) -> async Result.Result<Text, Text>;
    };

    let marketInteraction = actor(marketInteractionId) : actor {
        buyFUDDY: (playerId: Text, amount: Nat) -> async Result.Result<Text, Text>;
        getBalance: (playerId: Text) -> async Nat;
    };

    // Player Registration and Management Functions
    public shared func onboardNewPlayer(
        username: Text,
        email: ?Text,
        authMethod: {#EmailPassword; #GoogleSSO; #BlockchainWallet},
        referralCode: ?Text
    ) : async Result.Result<Text, Text> {
        if (registeredPlayers.contains(username)) {
            return #err("Username already registered");
        };

        try {
            let profileResult = await gameAuthenticator.createOrUpdateProfile(username, email, authMethod);
            switch (profileResult) {
                case (#err(e)) return #err("Authentication failed: " # e);
                case (#ok(profile)) {
                    let bankRegistration = await crystalBank.registerPlayer(username);
                    if (not bankRegistration) {
                        return #err("Failed to register with Crystal Bank");
                    };

                    registeredPlayers.put(username);

                    switch (referralCode) {
                        case (?code) {
                            let referralResult = await gameAuthenticator.applyReferralCode(code);
                            switch (referralResult) {
                                case (#err(e)) return #err("Referral failed: " # e);
                                case (_) {};
                            };
                        };
                        case (null) {};
                    };

                    #ok("Player onboarded successfully")
                };
            }
        } catch (error) {
            #err("Onboarding failed: " # Error.message(error))
        }
    };

    // NFT Management Functions
    public shared func createNFT(playerId: Text, name: Text, description: Text) : async Result.Result<Text, Text> {
        if (not registeredPlayers.contains(playerId)) {
            return #err("Player not registered");
        };

        let newNFT = {
            id = nextNFTId;
            name;
            description;
            timestamp = Time.now();
            owner = playerId;
        };

        let currentNFTs = playerNFTs.get(playerId).unwrapOr([]);
        playerNFTs.put(playerId, Array.append(currentNFTs, [newNFT]));
        nextNFTId += 1;
        #ok("NFT created successfully with ID: " # Nat.toText(newNFT.id))
    };

    // Query Functions
    public shared query func getPlayerNFTs(playerId: Text) : async [NFT] {
        playerNFTs.get(playerId).unwrapOr([])
    };

    public shared query func getAllNFTs() : async [NFT] {
        playerNFTs.values().flatMap(func(nfts) { nfts })
    };

    public shared func getPlayerFullProfile(playerId: Text) : async Result.Result<{
        profile: ?UserProfile;
        nfts: [NFT];
        balances: {
            crystalBankBalance: Nat;
            hybridWalletBalance: {inGameFuddy: Nat; realFuddy: Nat};
            marketBalance: Nat;
        };
        isRegistered: Bool;
    }, Text> {
        if (not registeredPlayers.contains(playerId)) {
            return #err("Player not registered");
        };

        try {
            let profile = await gameAuthenticator.getUserProfile(Principal.fromText(playerId));
            let crystalBankBalance = await crystalBank.getBalance(playerId);
            let hybridWalletBalance = await hybridWallet.getBalances(playerId);
            let marketBalance = await marketInteraction.getBalance(playerId);

            #ok({
                profile;
                nfts = playerNFTs.get(playerId).unwrapOr([]);
                balances = {
                    crystalBankBalance;
                    hybridWalletBalance;
                    marketBalance;
                };
                isRegistered = true;
            })
        } catch (error) {
            #err("Failed to fetch player profile: " # Error.message(error))
        }
    };
}
