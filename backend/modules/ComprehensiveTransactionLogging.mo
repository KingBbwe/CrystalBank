import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";

actor TransactionLogger {
    // Transaction Types
    type TransactionType = {
        #ItemPurchase;
        #ResourceExchange;
        #Reward;
        #Penalty;
        #GameEvent;
        #EconomicInteraction;
    };

    // Detailed Transaction Record
    type TransactionRecord = {
        id : Nat;
        timestamp : Time.Time;
        sender : Principal;
        recipient : ?Principal;
        transactionType : TransactionType;
        resourceType : Text;
        amount : Nat;
        gameContext : ?Text;
        metadata : [(Text, Text)];
    };

    // Transaction Storage
    private stable var transactions : [(Nat, TransactionRecord)] = [];
    private var transactionMap = HashMap.HashMap<Nat, TransactionRecord>(
        10, 
        Nat.equal, 
        Nat.hash
    );
    private stable var nextTransactionId : Nat = 1;

    // Log a new transaction
    public shared(msg) func logTransaction(
        transactionType : TransactionType,
        resourceType : Text,
        amount : Nat,
        recipient : ?Principal,
        gameContext : ?Text,
        additionalMetadata : [(Text, Text)]
    ) : async Result.Result<Nat, Text> {
        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TransactionRecord = {
            id = transactionId;
            timestamp = Time.now();
            sender = msg.caller;
            recipient = recipient;
            transactionType = transactionType;
            resourceType = resourceType;
            amount = amount;
            gameContext = gameContext;
            metadata = additionalMetadata;
        };

        transactionMap.put(transactionId, transaction);

        #ok(transactionId)
    }

    // Retrieve transactions for a specific player
    public query func getPlayerTransactions(
        player : Principal, 
        limit : ?Nat
    ) : async [TransactionRecord] {
        let playerTransactions = Buffer.Buffer<TransactionRecord>(0);

        for ((_, transaction) in transactionMap.entries()) {
            if (transaction.sender == player or 
                (transaction.recipient == ?player and transaction.recipient != null)) {
                playerTransactions.add(transaction);
            }
        };

        // Sort by timestamp (most recent first)
        let sortedTransactions = Buffer.toArray(playerTransactions);
        Array.sort(sortedTransactions, func(a, b) {
            Nat.compare(b.timestamp, a.timestamp)
        });

        // Apply optional limit
        switch (limit) {
            case (null) { sortedTransactions };
            case (?maxLimit) { 
                Array.subArray(sortedTransactions, 0, Nat.min(maxLimit, sortedTransactions.size())) 
            };
        }
    }

    // Aggregate transaction statistics
    public query func getTransactionStatistics(
        timeframe : ?Time.Time
    ) : async {
        totalTransactions : Nat;
        totalResourcesExchanged : Nat;
        mostFrequentTransactionType : TransactionType;
    } {
        var totalTransactions = 0;
        var totalResourcesExchanged = 0;
        var transactionTypeCounts = HashMap.HashMap<TransactionType, Nat>(
            10, 
            func(a, b) { a == b }, 
            func(a) { 
                switch (a) {
                    case (#ItemPurchase) { 0 };
                    case (#ResourceExchange) { 1 };
                    case (#Reward) { 2 };
                    case (#Penalty) { 3 };
                    case (#GameEvent) { 4 };
                    case (#EconomicInteraction) { 5 };
                }
            }
        );

        for ((_, transaction) in transactionMap.entries()) {
            // Optional timeframe filtering
            let isWithinTimeframe = switch (timeframe) {
                case (null) { true };
                case (?cutoffTime) { transaction.timestamp >= cutoffTime };
            };

            if (isWithinTimeframe) {
                totalTransactions += 1;
                totalResourcesExchanged += transaction.amount;

                // Count transaction types
                switch (transactionTypeCounts.get(transaction.transactionType)) {
                    case (null) { 
                        transactionTypeCounts.put(transaction.transactionType, 1); 
                    };
                    case (?count) { 
                        transactionTypeCounts.put(transaction.transactionType, count + 1); 
                    };
                };
            }
        };

        // Find most frequent transaction type
        var mostFrequentType : TransactionType = #ItemPurchase;
        var highestCount = 0;
        for ((transactionType, count) in transactionTypeCounts.entries()) {
            if (count > highestCount) {
                highestCount := count;
                mostFrequentType := transactionType;
            }
        };

        {
            totalTransactions = totalTransactions;
            totalResourcesExchanged = totalResourcesExchanged;
            mostFrequentTransactionType = mostFrequentType;
        }
    }

    // System upgrade hooks
    system func preupgrade() {
        transactions := Iter.toArray(transactionMap.entries());
    }

    system func postupgrade() {
        transactionMap := HashMap.fromIter<Nat, TransactionRecord>(
            transactions.vals(), 
            10, 
            Nat.equal, 
            Nat.hash
        );
    }
}
