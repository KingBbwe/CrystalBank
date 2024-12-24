import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";

actor class GameAuthSystem() {
    // Type definitions
    public type UserProfile = {
        username : Text;
        email : ?Text;
        registrationTimestamp : Time.Time;
        lastLoginTimestamp : Time.Time;
        accountTier : AccountTier;
        referralCode : Text;
        linkedAccounts : [Principal];
        authMethods : [AuthenticationMethod];
        status : UserStatus;
        lastActivity : Time.Time;
    };

    public type UserStatus = {
        #Active;
        #Suspended;
        #Banned;
        #PendingVerification;
    };

    public type AccountTier = {
        #Novice;
        #Regular;
        #Veteran;
        #Elite;
        #GameMaster;
    };

    public type AuthenticationMethod = {
        #EmailPassword;
        #GoogleSSO;
        #BlockchainWallet : Principal;
    };

    public type AuthError = {
        #ProfileNotFound;
        #InvalidCredentials;
        #AccountSuspended;
        #RateLimited;
        #InvalidOperation;
        #SystemError;
    };

    // Stable storage
    private stable var userProfileEntries : [(Principal, UserProfile)] = [];
    private stable var referralEntries : [(Text, Principal)] = [];
    private stable var adminPrincipals : [Principal] = [];
    private stable var systemPaused : Bool = false;

    // Runtime storage
    private var userProfiles = HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);
    private var referralMap = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
    private var authAttempts = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);

    // Constants
    private let MAX_AUTH_ATTEMPTS : Nat = 5;
    private let AUTH_COOLDOWN : Int = 300_000_000_000; // 5 minutes in nanoseconds
    private let PROFILE_UPDATE_COOLDOWN : Int = 86_400_000_000_000; // 24 hours in nanoseconds

    // System upgrade hooks
    system func preupgrade() {
        userProfileEntries := Iter.toArray(userProfiles.entries());
        referralEntries := Iter.toArray(referralMap.entries());
    };

    system func postupgrade() {
        userProfiles := HashMap.fromIter<Principal, UserProfile>(userProfileEntries.vals(), 10, Principal.equal, Principal.hash);
        referralMap := HashMap.fromIter<Text, Principal>(referralEntries.vals(), 10, Text.equal, Text.hash);
        userProfileEntries := [];
        referralEntries := [];
    };

    // Authorization helper
    private func _isAuthorized(caller : Principal) : Bool {
        Array.find<Principal>(adminPrincipals, func(p) { p == caller }) != null;
    };

    // Rate limiting helper
    private func _isRateLimited(principal : Principal) : Bool {
        switch (authAttempts.get(principal)) {
            case (?attempts) {
                attempts >= MAX_AUTH_ATTEMPTS
            };
            case null { false };
        };
    };

    // Profile Creation and Management
    public shared({ caller }) func createOrUpdateProfile(
        username : Text,
        email : ?Text,
        authMethod : AuthenticationMethod
    ) : async Result.Result<UserProfile, AuthError> {
        if (systemPaused) return #err(#SystemError);
        if (_isRateLimited(caller)) return #err(#RateLimited);

        let referralCode = await _generateUniqueReferralCode(username);
        
        let profile : UserProfile = {
            username;
            email;
            registrationTimestamp = Time.now();
            lastLoginTimestamp = Time.now();
            accountTier = #Novice;
            referralCode;
            linkedAccounts = [caller];
            authMethods = [authMethod];
            status = #PendingVerification;
            lastActivity = Time.now();
        };

        userProfiles.put(caller, profile);
        referralMap.put(referralCode, caller);

        #ok(profile)
    };

    public shared({ caller }) func verifyProfile() : async Result.Result<UserProfile, AuthError> {
        switch (userProfiles.get(caller)) {
            case (?profile) {
                if (profile.status == #PendingVerification) {
                    let updatedProfile = {
                        profile with
                        status = #Active;
                        lastActivity = Time.now();
                    };
                    userProfiles.put(caller, updatedProfile);
                    #ok(updatedProfile)
                } else {
                    #err(#InvalidOperation)
                };
            };
            case null #err(#ProfileNotFound);
        }
    };

    // Referral System
    public shared({ caller }) func applyReferralCode(referralCode : Text) : async Result.Result<Text, AuthError> {
        if (systemPaused) return #err(#SystemError);
        if (_isRateLimited(caller)) return #err(#RateLimited);

        switch (referralMap.get(referralCode)) {
            case (?referrerPrincipal) {
                if (referrerPrincipal == caller) {
                    return #err(#InvalidOperation);
                };

                switch (userProfiles.get(referrerPrincipal), userProfiles.get(caller)) {
                    case (?referrerProfile, ?callerProfile) {
                        if (callerProfile.status != #Active) {
                            return #err(#AccountSuspended);
                        };

                        let updatedReferrer = _upgradeProfile(referrerProfile);
                        let updatedCaller = _upgradeProfile(callerProfile);

                        userProfiles.put(referrerPrincipal, updatedReferrer);
                        userProfiles.put(caller, updatedCaller);

                        #ok("Referral bonus applied successfully")
                    };
                    case (_, _) #err(#ProfileNotFound);
                };
            };
            case null #err(#InvalidOperation);
        }
    };

    // Admin Functions
    public shared({ caller }) func addAdmin(principal : Principal) : async Result.Result<(), AuthError> {
        if (not _isAuthorized(caller)) return #err(#InvalidOperation);
        adminPrincipals := Array.append(adminPrincipals, [principal]);
        #ok()
    };

    public shared({ caller }) func suspendAccount(principal : Principal) : async Result.Result<(), AuthError> {
        if (not _isAuthorized(caller)) return #err(#InvalidOperation);
        
        switch (userProfiles.get(principal)) {
            case (?profile) {
                let updatedProfile = {
                    profile with
                    status = #Suspended;
                    lastActivity = Time.now();
                };
                userProfiles.put(principal, updatedProfile);
                #ok()
            };
            case null #err(#ProfileNotFound);
        }
    };

    // Query Methods
    public query func getUserProfile(principal : Principal) : async Result.Result<UserProfile, AuthError> {
        switch (userProfiles.get(principal)) {
            case (?profile) { #ok(profile) };
            case null { #err(#ProfileNotFound) };
        }
    };

    public query func getAccountTier(principal : Principal) : async Result.Result<AccountTier, AuthError> {
        switch (userProfiles.get(principal)) {
            case (?profile) { #ok(profile.accountTier) };
            case null { #err(#ProfileNotFound) };
        }
    };

    // Private Helper Functions
    private func _upgradeProfile(profile : UserProfile) : UserProfile {
        {
            profile with
            accountTier = _upgradeAccountTier(profile.accountTier);
            lastActivity = Time.now();
        }
    };

    private func _upgradeAccountTier(currentTier : AccountTier) : AccountTier {
        switch (currentTier) {
            case (#Novice) { #Regular };
            case (#Regular) { #Veteran };
            case (#Veteran) { #Elite };
            case (#Elite) { #GameMaster };
            case (#GameMaster) { #GameMaster };
        }
    };

    private func _generateUniqueReferralCode(username : Text) : async Text {
        let timestamp = Int.toText(Time.now());
        let code = Text.concat(username, Text.concat("-", timestamp));
        if (referralMap.get(code) != null) {
            return await _generateUniqueReferralCode(username);
        };
        code
    };
};
