import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Error "mo:base/Error";
import Time "mo:base/Time";

actor class LiquidityPoolAccess() {
    // Type definitions
    public type PlayerID = Text;
    public type PoolError = {
        #InsufficientLiquidity;
        #InvalidAmount;
        #RateLimitExceeded;
        #PoolPaused;
    };

    // Pool configuration
    private let INITIAL_POOL_BALANCE: Nat = 1_000_000;
    private let MAX_ACQUISITION_PER_REQUEST: Nat = 100_000;
    private let MIN_POOL_BALANCE: Nat = 100_000;

    // Pool state
    private stable var poolBalance: Nat = INITIAL_POOL_BALANCE;
    private stable var isPaused: Bool = false;
    private stable var lastAcquisitionTime = HashMap.HashMap<PlayerID, Int>(10, Text.equal, Text.hash);

    // Rate limiting
    private let RATE_LIMIT_DURATION_NS: Int = 3600_000_000_000; // 1 hour in nanoseconds

    // Acquire FUDDY tokens from the pool
    public shared func acquireFUDDYFromPool(
        playerId: PlayerID,
        amount: Nat
    ) : async Result.Result<Text, PoolError> {
        if (isPaused) {
            return #err(#PoolPaused);
        };

        if (amount == 0 or amount > MAX_ACQUISITION_PER_REQUEST) {
            return #err(#InvalidAmount);
        };

        if (amount > poolBalance or (poolBalance - amount) < MIN_POOL_BALANCE) {
            return #err(#InsufficientLiquidity);
        };

        // Check rate limiting
        let currentTime = Time.now();
        switch (lastAcquisitionTime.get(playerId)) {
            case (?lastTime) {
                if (currentTime - lastTime < RATE_LIMIT_DURATION_NS) {
                    return #err(#RateLimitExceeded);
                };
            };
            case null {};
        };

        // Update pool balance and last acquisition time
        poolBalance -= amount;
        lastAcquisitionTime.put(playerId, currentTime);

        #ok("Successfully acquired " # Nat.toText(amount) # " FUDDY tokens from pool")
    };

    // Get current pool balance
    public query func getPoolBalance() : async Nat {
        poolBalance
    };

    // Get maximum acquisition amount per request
    public query func getMaxAcquisitionAmount() : async Nat {
        MAX_ACQUISITION_PER_REQUEST
    };

    // Check if a player is rate limited
    public query func isRateLimited(playerId: PlayerID) : async Bool {
        switch (lastAcquisitionTime.get(playerId)) {
            case (?lastTime) {
                Time.now() - lastTime < RATE_LIMIT_DURATION_NS
            };
            case null { false };
        }
    };

    // Emergency pause/unpause (should be restricted to admin in production)
    public shared func togglePoolPause() : async Bool {
        isPaused := not isPaused;
        isPaused
    };
};
