module {
    import Nat "mo:base/Nat";
    import Text "mo:base/Text";
    import Int "mo:base/Int";

    // NFT Type Definitions
    public type PlayerID = Text;
    public type NFT = {
        id: Nat;
        name: Text;
        description: Text;
        timestamp: Int;
        owner: PlayerID; // Added owner to align with shared functionality
    };

    public func createNFT(
        id: Nat,
        name: Text,
        description: Text,
        timestamp: Int,
        owner: PlayerID
    ): NFT {
        return { id; name; description; timestamp; owner };
    };
};
