module {
    import Text "mo:base/Text";
    import Time "mo:base/Time";
    import Principal "mo:base/Principal";

    // Account Tiers
    public type AccountTier = {
        #Novice;
        #Regular;
        #Veteran;
        #Elite;
        #GameMaster;
    };

    // User Profile
    public type UserProfile = {
        username: Text;
        email: ?Text;
        registrationTimestamp: Time.Time;
        lastLoginTimestamp: Time.Time;
        accountTier: AccountTier;
        referralCode: Text;
        linkedAccounts: [Principal];
    };

    // Utility to create a new UserProfile
    public func createUserProfile(
        username: Text,
        email: ?Text,
        registrationTimestamp: Time.Time,
        lastLoginTimestamp: Time.Time,
        accountTier: AccountTier,
        referralCode: Text,
        linkedAccounts: [Principal]
    ): UserProfile {
        return {
            username;
            email;
            registrationTimestamp;
            lastLoginTimestamp;
            accountTier;
            referralCode;
            linkedAccounts;
        };
    };

    // Default User Profile
    public func defaultUserProfile(username: Text, timestamp: Time.Time): UserProfile {
        return {
            username;
            email = null;
            registrationTimestamp = timestamp;
            lastLoginTimestamp = timestamp;
            accountTier = #Novice;
            referralCode = "";
            linkedAccounts = [];
        };
    };
};
