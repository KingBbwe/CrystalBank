import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";

actor class NFTManagement() {
    // Type definitions
    public type PlayerID = Text;
    public type NFT = {
        id: Nat;
        name: Text;
        description: Text;
        timestamp: Int;
    };

    private stable var nftEntries : [(PlayerID, [NFT])] = [];
    private var playerNFTs = HashMap.HashMap<PlayerID, [NFT]>(10, Text.equal, Text.hash);
    private stable var nextNFTId: Nat = 1;

    // System upgrade hooks
    system func preupgrade() {
        nftEntries := Iter.toArray(playerNFTs.entries());
    };

    system func postupgrade() {
        playerNFTs := HashMap.fromIter<PlayerID, [NFT]>(
            nftEntries.vals(),
            10,
            Text.equal,
            Text.hash
        );
        nftEntries := [];
    };

    // Create a new NFT for a player
    public shared func createNFT(
        playerId: PlayerID,
        name: Text,
        description: Text
    ) : async Result.Result<Text, Text> {
        let newNFT : NFT = {
            id = nextNFTId;
            name;
            description;
            timestamp = Time.now();
        };

        let currentNFTs = playerNFTs.get(playerId);
        switch (currentNFTs) {
            case (null) {
                playerNFTs.put(playerId, [newNFT]);
            };
            case (?nfts) {
                let updatedNFTs = Array.append(nfts, [newNFT]);
                playerNFTs.put(playerId, updatedNFTs);
            };
        };

        nextNFTId += 1;
        #ok("NFT created successfully")
    };

    // Get all NFTs owned by a player
    public query func getPlayerNFTs(playerId: PlayerID) : async [NFT] {
        switch (playerNFTs.get(playerId)) {
            case (null) { [] };
            case (?nfts) { nfts };
        }
    };

    // Get all NFTs in the system
    public query func getAllNFTs() : async [NFT] {
        let buffer = Buffer.Buffer<NFT>(0);
        for (nfts in playerNFTs.vals()) {
            for (nft in nfts.vals()) {
                buffer.add(nft);
            };
        };
        Buffer.toArray(buffer)
    };
};
