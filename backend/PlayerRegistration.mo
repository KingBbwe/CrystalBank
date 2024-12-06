actor PlayerRegistration {
    type PlayerID = Text;
    stable var registeredPlayers: Set<PlayerID> = Set.empty();

    public func registerPlayer(playerId: PlayerID): async Bool {
        if (Set.contains(registeredPlayers, playerId)) {
            return false; // Player already registered
        };
        registeredPlayers := Set.insert(registeredPlayers, playerId);
        return true;
    };

    public func isRegistered(playerId: PlayerID): async Bool {
        return Set.contains(registeredPlayers, playerId);
    };

    public func removePlayer(playerId: PlayerID): async Bool {
        if (!Set.contains(registeredPlayers, playerId)) {
            return false; // Player not found
        };
        registeredPlayers := Set.remove(registeredPlayers, playerId);
        return true;
    };

    public func getRegisteredPlayers(): async [PlayerID] {
        return Set.toArray(registeredPlayers);
    };
};

