actor NFTManagement {
    type PlayerID = Text;
    type NFT = { id: Nat; name: Text; description: Text; timestamp: Int };

    stable var playerNFTs: HashMap.HashMap<PlayerID, [NFT]> = HashMap.HashMap();
    stable var nextNFTId: Nat = 1;

    public shared func createNFT(playerId: PlayerID, name: Text, description: Text): async Result<Text, Text> {
        let newNFT = { id = nextNFTId; name; description; timestamp = Time.now() };
        let nftList = playerNFTs.get(playerId).unwrapOr([]);
        playerNFTs.put(playerId, Array.append(nftList, [newNFT]));
        nextNFTId += 1;
        return #ok("NFT created successfully");
    };

    public shared func getPlayerNFTs(playerId: PlayerID): async [NFT] {
        return playerNFTs.get(playerId).unwrapOr([]);
    };

    public shared func getAllNFTs(): async [NFT] {
        return playerNFTs.values().flatMap(func(nfts) { nfts });
    };
};
