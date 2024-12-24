// PlayerRegistration.mo
import HashSet "mo:base/HashSet";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

actor class PlayerRegistration() {
    // Type definitions
    public type PlayerID = Text;

    // Initialize the stable variable with explicit hash function
    private let textHash: Text.Hash = Text.hash;
    private stable var registeredPlayers: HashSet.HashSet<PlayerID> = HashSet.HashSet<PlayerID>(10, Text.equal, textHash);

    // Register a new player
    public shared func registerPlayer(playerId: PlayerID) : async Bool {
        if (registeredPlayers.has(playerId)) {
            return false; // Player already registered
        };
        registeredPlayers.add(playerId);
        return true;
    };

    // Check if a player is registered
    public query func isRegistered(playerId: PlayerID) : async Bool {
        registeredPlayers.has(playerId)
    };

    // Remove a player from registration
    public shared func removePlayer(playerId: PlayerID) : async Bool {
        if (not registeredPlayers.has(playerId)) {
            return false; // Player not found
        };
        registeredPlayers.delete(playerId);
        return true;
    };

    // Get all registered players
    public query func getRegisteredPlayers() : async [PlayerID] {
        HashSet.toArray(registeredPlayers)
    };
};
