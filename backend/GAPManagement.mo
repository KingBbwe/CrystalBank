import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

actor GameAuthenticator {
    // User Profile Structure
    type UserProfile = {
        username : Text;
        email : ?Text;
        registrationTimestamp : Time.Time;
        lastLoginTimestamp : Time.Time;
        accountTier : AccountTier;
        referralCode : Text;
        linkedAccounts : [Principal];
    };

    type AccountTier = {
        #Novice;
        #Regular;
        #Veteran;
        #Elite;
        #GameMaster;
    };

    type AuthenticationMethod = {
        #EmailPassword;
        #GoogleSSO;
        #BlockchainWallet;
    };

    // Storage for user profiles
    private stable var userProfiles = HashMap.HashMap<Principal, UserProfile>(
        10, 
        Principal.equal, 
        Principal.hash
    );

    // Referral tracking
    private stable var referralMap = HashMap.HashMap<Text, Principal>(
        10, 
        Text.equal, 
        Text.hash
    );

    // Create or Update User Profile
    public shared(msg) func createOrUpdateProfile(
        username : Text, 
        email : ?Text,
        authMethod : AuthenticationMethod
    ) : async Result.Result<UserProfile, Text> {
        let caller = msg.caller;

        // Generate unique referral code
        let referralCode = _generateReferralCode(username);

        let userProfile : UserProfile = {
            username = username;
            email = email;
            registrationTimestamp = Time.now();
            lastLoginTimestamp = Time.now();
            accountTier = #Novice;
            referralCode = referralCode;
            linkedAccounts = [caller];
        };

        userProfiles.put(caller, userProfile);
        referralMap.put(referralCode, caller);

        #ok(userProfile)
    }

    // Apply Referral Bonus
    public shared(msg) func applyReferralCode(
        referralCode : Text
    ) : async Result.Result<Text, Text> {
        let caller = msg.caller;

        // Lookup referrer
        let ?referrerPrincipal = referralMap.get(referralCode)
            else return #err("Invalid referral code");

        // Prevent self-referral
        if (referrerPrincipal == caller) {
            return #err("Cannot use own referral code");
        }

        // Upgrade account tier for both referrer and referred
        switch (userProfiles.get(referrerPrincipal), userProfiles.get(caller)) {
            case (?referrerProfile, ?callerProfile) {
                let upgradedReferrerProfile = {
                    referrerProfile with 
                    accountTier = _upgradeAccountTier(referrerProfile.accountTier)
                };

                let upgradedCallerProfile = {
                    callerProfile with 
                    accountTier = _upgradeAccountTier(callerProfile.accountTier)
                };

                userProfiles.put(referrerPrincipal, upgradedReferrerProfile);
                userProfiles.put(caller, upgradedCallerProfile);

                return #ok("Referral bonus applied");
            };
            case (_, _) { 
                return #err("Profile not found"); 
            };
        };
    }

    // Private Utility Functions
    private func _generateReferralCode(
        username : Text
    ) : Text {
        // Simple referral code generation
        // In production, use a more robust method
        username # Text.fromChar(Char.fromNat32(Random.nextNat32() % 1000))
    }

    private func _upgradeAccountTier(
        currentTier : AccountTier
    ) : AccountTier {
        switch (currentTier) {
            case (#Novice) { #Regular };
            case (#Regular) { #Veteran };
            case (#Veteran) { #Elite };
            case (#Elite or #GameMaster) { currentTier };
        }
    }

    // Query user profile
    public query func getUserProfile(
        principal : Principal
    ) : async ?UserProfile {
        userProfiles.get(principal)
    }
}
