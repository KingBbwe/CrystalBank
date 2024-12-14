import HashSet "mo:base/HashSet";

actor PlayerRegistration {
    type PlayerID = Text;

    stable var registeredPlayers: HashSet.HashSet<PlayerID> = HashSet.HashSet();

    public shared func registerPlayer(playerId: PlayerID): async Bool {
        if (registeredPlayers.contains(playerId)) {
            return false; // Player already registered
        };
        registeredPlayers.put(playerId);
        return true;
    };

    public shared func isRegistered(playerId: PlayerID): async Bool {
        return registeredPlayers.contains(playerId);
    };

    public shared func removePlayer(playerId: PlayerID): async Bool {
        if (not registeredPlayers.contains(playerId)) {
            return false; // Player not found
        };
        registeredPlayers.remove(playerId);
        return true;
    };

    public shared func getRegisteredPlayers(): async [PlayerID] {
        return registeredPlayers.toArray();
    };
};
