import Principal "mo:base/Principal";

actor class BlockchainWallet(canisterId: Principal) {
    public shared func deposit(playerId: Text, amount: Nat): async Result<Text, Text> {
        // Call the token canister's `transfer` function
        let tokenCanister = actor (canisterId : Principal) : Token {};
        let result = await tokenCanister.transfer(playerId, amount);

        return result;
    }
}
